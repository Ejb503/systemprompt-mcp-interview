import { google } from "googleapis";
import { GoogleBaseService } from "./google-base-service.js";
import { gmail_v1 } from "googleapis/build/src/apis/gmail/v1.js";
import { EmailMetadata, SendEmailOptions, DraftEmailOptions } from "../types/gmail-types.js";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

function validateEmailList(emails: string | string[] | undefined): void {
  if (!emails) return;

  const emailList = Array.isArray(emails) ? emails : emails.split(",").map((e) => e.trim());

  for (const email of emailList) {
    if (!validateEmail(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }
  }
}

export class GmailService extends GoogleBaseService {
  private gmail!: gmail_v1.Gmail;
  private labelCache: Map<string, gmail_v1.Schema$Label> = new Map();
  private gmailInitPromise: Promise<void>;

  constructor() {
    super();
    this.gmailInitPromise = this.initializeGmailClient();
  }

  private async initializeGmailClient(): Promise<void> {
    await this.waitForInit();
    this.gmail = google.gmail({ version: "v1", auth: this.auth.getAuth() });
  }

  // Helper method to ensure initialization is complete
  private async ensureInitialized(): Promise<void> {
    await this.gmailInitPromise;
  }

  private async loadLabels(): Promise<void> {
    await this.ensureInitialized();
    if (this.labelCache.size === 0) {
      const labels = await this.getLabels();
      labels.forEach((label) => {
        this.labelCache.set(label.id!, label);
      });
    }
  }

  private parseEmailAddress(address: string): { name?: string; email: string } {
    const match = address.match(/(?:"?([^"]*)"?\s)?(?:<)?(.+@[^>]+)(?:>)?/);
    if (match) {
      return {
        name: match[1]?.trim(),
        email: match[2].trim(),
      };
    }
    return { email: address.trim() };
  }

  private async getMessageMetadata(messageId: string): Promise<gmail_v1.Schema$Message> {
    await this.ensureInitialized();
    try {
      const response = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "metadata",
        metadataHeaders: [
          "From",
          "To",
          "Cc",
          "Bcc",
          "Subject",
          "Date",
          "Reply-To",
          "Message-ID",
          "References",
          "Content-Type",
        ],
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get message metadata for ${messageId}:`, error);
      throw error;
    }
  }

  private async extractEmailMetadata(message: gmail_v1.Schema$Message): Promise<EmailMetadata> {
    await this.loadLabels();
    const headers = message.payload?.headers || [];
    const fromHeader = headers.find((h) => h.name === "From")?.value || "";
    const toHeader = headers.find((h) => h.name === "To")?.value || "";
    const dateStr = headers.find((h) => h.name === "Date")?.value;

    const labels = (message.labelIds || [])
      .map((id) => {
        const label = this.labelCache.get(id);
        return label ? { id, name: label.name || id } : null;
      })
      .filter((label): label is { id: string; name: string } => label !== null);

    return {
      id: message.id!,
      threadId: message.threadId!,
      snippet: message.snippet?.replace(/&#39;/g, "'").replace(/&quot;/g, '"') || "",
      from: this.parseEmailAddress(fromHeader),
      to: toHeader.split(",").map((addr) => this.parseEmailAddress(addr.trim())),
      subject: headers.find((h) => h.name === "Subject")?.value || "(no subject)",
      date: dateStr ? new Date(dateStr) : new Date(),
      labels,
      hasAttachments: Boolean(
        message.payload?.parts?.some((part) => part.filename && part.filename.length > 0),
      ),
      isUnread: message.labelIds?.includes("UNREAD") || false,
      isImportant: message.labelIds?.includes("IMPORTANT") || false,
    };
  }

  async listMessages(maxResults: number = 100): Promise<EmailMetadata[]> {
    await this.ensureInitialized();
    try {
      const response = await this.gmail.users.messages.list({
        userId: "me",
        maxResults,
      });

      const messages = response.data.messages || [];
      const messageDetails = await Promise.all(
        messages.map((msg) => this.getMessageMetadata(msg.id!)),
      );

      return await Promise.all(messageDetails.map((msg) => this.extractEmailMetadata(msg)));
    } catch (error) {
      console.error("Failed to list Gmail messages:", error);
      throw error;
    }
  }

  async getMessage(messageId: string): Promise<EmailMetadata & { body: string }> {
    await this.ensureInitialized();
    try {
      const response = await this.gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const metadata = await this.extractEmailMetadata(response.data);
      let body = "";

      // Extract message body
      const message = response.data;
      if (message.payload) {
        if (message.payload.body?.data) {
          body = Buffer.from(message.payload.body.data, "base64").toString("utf8");
        } else if (message.payload.parts) {
          const textPart = message.payload.parts.find(
            (part) => part.mimeType === "text/plain" || part.mimeType === "text/html",
          );
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, "base64").toString("utf8");
          }
        }
      }

      return {
        ...metadata,
        body,
      };
    } catch (error) {
      console.error("Failed to get Gmail message:", error);
      throw error;
    }
  }

  async searchMessages(query: string, maxResults: number = 10): Promise<EmailMetadata[]> {
    await this.ensureInitialized();
    try {
      const response = await this.gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults,
      });

      const messages = response.data.messages || [];
      const messageDetails = await Promise.all(
        messages.map((msg) => this.getMessageMetadata(msg.id!)),
      );

      return await Promise.all(messageDetails.map((msg) => this.extractEmailMetadata(msg)));
    } catch (error) {
      console.error("Failed to search Gmail messages:", error);
      throw error;
    }
  }

  async getLabels(): Promise<gmail_v1.Schema$Label[]> {
    await this.ensureInitialized();
    try {
      const response = await this.gmail.users.labels.list({
        userId: "me",
      });

      return response.data.labels || [];
    } catch (error) {
      console.error("Failed to get Gmail labels:", error);
      throw error;
    }
  }

  private createEmailRaw(options: SendEmailOptions): string {
    const boundary = "boundary" + Date.now().toString();
    const toList = Array.isArray(options.to) ? options.to : [options.to];
    const ccList = options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : [];
    const bccList = options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : [];

    let email = [
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "MIME-Version: 1.0",
      `To: ${toList.join(", ")}`,
      `Subject: ${options.subject}`,
    ];

    if (ccList.length > 0) email.push(`Cc: ${ccList.join(", ")}`);
    if (bccList.length > 0) email.push(`Bcc: ${bccList.join(", ")}`);
    if (options.replyTo) email.push(`Reply-To: ${options.replyTo}`);

    email.push("", `--${boundary}`);

    // Add the email body
    email.push(
      `Content-Type: ${options.isHtml ? "text/html" : "text/plain"}; charset="UTF-8"`,
      "MIME-Version: 1.0",
      "Content-Transfer-Encoding: 7bit",
      "",
      options.body,
      "",
    );

    // Add attachments if any
    if (options.attachments?.length) {
      for (const attachment of options.attachments) {
        const content = Buffer.isBuffer(attachment.content)
          ? attachment.content.toString("base64")
          : Buffer.from(attachment.content).toString("base64");

        email.push(
          `--${boundary}`,
          "Content-Type: " + (attachment.contentType || "application/octet-stream"),
          "MIME-Version: 1.0",
          "Content-Transfer-Encoding: base64",
          `Content-Disposition: attachment; filename="${attachment.filename}"`,
          "",
          content.replace(/(.{76})/g, "$1\n"),
          "",
        );
      }
    }

    email.push(`--${boundary}--`);

    return Buffer.from(email.join("\r\n")).toString("base64url");
  }

  async sendEmail(options: SendEmailOptions): Promise<string> {
    await this.ensureInitialized();
    try {
      // Validate email addresses
      validateEmailList(options.to);
      validateEmailList(options.cc);
      validateEmailList(options.bcc);

      const raw = this.createEmailRaw(options);
      const response = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: { raw },
      });

      return response.data.id!;
    } catch (error: any) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  async createDraft(options: DraftEmailOptions): Promise<string> {
    await this.ensureInitialized();
    try {
      // Validate email addresses
      validateEmailList(options.to);
      validateEmailList(options.cc);
      validateEmailList(options.bcc);

      const raw = this.createEmailRaw(options);
      const response = await this.gmail.users.drafts.create({
        userId: "me",
        requestBody: {
          message: { raw },
        },
      });

      return response.data.id!;
    } catch (error: any) {
      console.error("Failed to create draft:", error);
      throw error;
    }
  }

  async updateDraft(options: DraftEmailOptions): Promise<string> {
    if (!options.id) {
      throw new Error("Draft ID is required for updating");
    }

    await this.ensureInitialized();
    try {
      // Validate email addresses
      validateEmailList(options.to);
      validateEmailList(options.cc);
      validateEmailList(options.bcc);

      const raw = this.createEmailRaw(options);
      const response = await this.gmail.users.drafts.update({
        userId: "me",
        id: options.id,
        requestBody: {
          message: { raw },
        },
      });

      return response.data.id!;
    } catch (error: any) {
      console.error("Failed to update draft:", error);
      throw error;
    }
  }

  async listDrafts(maxResults: number = 10): Promise<EmailMetadata[]> {
    await this.ensureInitialized();
    try {
      const response = await this.gmail.users.drafts.list({
        userId: "me",
        maxResults,
      });

      const drafts = response.data.drafts || [];
      const messageDetails = await Promise.all(
        drafts.map((draft) => this.getMessageMetadata(draft.message!.id!)),
      );

      return await Promise.all(messageDetails.map((msg) => this.extractEmailMetadata(msg)));
    } catch (error) {
      console.error("Failed to list drafts:", error);
      throw error;
    }
  }

  async deleteDraft(draftId: string): Promise<void> {
    await this.ensureInitialized();
    try {
      await this.gmail.users.drafts.delete({
        userId: "me",
        id: draftId,
      });
    } catch (error) {
      console.error("Failed to delete draft:", error);
      throw error;
    }
  }

  async getDraft(draftId: string): Promise<EmailMetadata & { body: string }> {
    await this.ensureInitialized();
    try {
      const response = await this.gmail.users.drafts.get({
        userId: "me",
        id: draftId,
        format: "full",
      });

      if (!response.data.message) {
        throw new Error("Draft message not found");
      }

      const metadata = await this.extractEmailMetadata(response.data.message);
      let body = "";

      // Extract message body
      const message = response.data.message;
      if (message.payload) {
        if (message.payload.body?.data) {
          body = Buffer.from(message.payload.body.data, "base64").toString("utf8");
        } else if (message.payload.parts) {
          const textPart = message.payload.parts.find(
            (part) => part.mimeType === "text/plain" || part.mimeType === "text/html",
          );
          if (textPart?.body?.data) {
            body = Buffer.from(textPart.body.data, "base64").toString("utf8");
          }
        }
      }

      return {
        ...metadata,
        body,
      };
    } catch (error) {
      console.error("Failed to get draft:", error);
      throw error;
    }
  }

  async modifyMessage(
    messageId: string,
    options: {
      addLabelIds?: string[];
      removeLabelIds?: string[];
    },
  ): Promise<EmailMetadata> {
    await this.ensureInitialized();
    try {
      const response = await this.gmail.users.messages.modify({
        userId: "me",
        id: messageId,
        requestBody: options,
      });

      return this.extractEmailMetadata(response.data);
    } catch (error) {
      console.error("Failed to modify message:", error);
      throw error;
    }
  }

  async trashMessage(messageId: string): Promise<void> {
    await this.ensureInitialized();
    try {
      await this.gmail.users.messages.trash({
        userId: "me",
        id: messageId,
      });
    } catch (error) {
      console.error("Failed to trash message:", error);
      throw error;
    }
  }

  async untrashMessage(messageId: string): Promise<void> {
    await this.ensureInitialized();
    try {
      await this.gmail.users.messages.untrash({
        userId: "me",
        id: messageId,
      });
    } catch (error) {
      console.error("Failed to untrash message:", error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.ensureInitialized();
    try {
      await this.gmail.users.messages.delete({
        userId: "me",
        id: messageId,
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
      throw error;
    }
  }

  async createLabel(
    name: string,
    options: {
      textColor?: string;
      backgroundColor?: string;
      messageListVisibility?: "hide" | "show";
      labelListVisibility?: "labelHide" | "labelShow" | "labelShowIfUnread";
    } = {},
  ): Promise<gmail_v1.Schema$Label> {
    await this.ensureInitialized();
    try {
      const response = await this.gmail.users.labels.create({
        userId: "me",
        requestBody: {
          name,
          messageListVisibility: options.messageListVisibility,
          labelListVisibility: options.labelListVisibility,
          color:
            options.textColor || options.backgroundColor
              ? {
                  textColor: options.textColor,
                  backgroundColor: options.backgroundColor,
                }
              : undefined,
        },
      });

      // Update label cache
      this.labelCache.set(response.data.id!, response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to create label:", error);
      throw error;
    }
  }

  async deleteLabel(labelId: string): Promise<void> {
    await this.ensureInitialized();
    try {
      await this.gmail.users.labels.delete({
        userId: "me",
        id: labelId,
      });
      // Remove from cache
      this.labelCache.delete(labelId);
    } catch (error) {
      console.error("Failed to delete label:", error);
      throw error;
    }
  }

  async replyEmail(messageId: string, body: string, isHtml: boolean = false): Promise<string> {
    await this.ensureInitialized();
    try {
      // Get the original message to extract threading information
      const originalMessage: gmail_v1.Schema$Message = (
        await this.gmail.users.messages.get({
          userId: "me",
          id: messageId,
          format: "metadata",
          metadataHeaders: ["Subject", "Message-ID", "References", "From", "To"],
        })
      ).data;

      const headers = originalMessage.payload?.headers || [];
      const subjectHeader = headers.find(
        (h: gmail_v1.Schema$MessagePartHeader) => h.name === "Subject",
      );
      const messageIdHeader = headers.find(
        (h: gmail_v1.Schema$MessagePartHeader) => h.name === "Message-ID",
      );
      const referencesHeader = headers.find(
        (h: gmail_v1.Schema$MessagePartHeader) => h.name === "References",
      );
      const fromHeader = headers.find((h: gmail_v1.Schema$MessagePartHeader) => h.name === "From");
      const toHeader = headers.find((h: gmail_v1.Schema$MessagePartHeader) => h.name === "To");

      const subject = subjectHeader?.value || "";
      const originalMessageId = messageIdHeader?.value || "";
      const references = referencesHeader?.value || "";
      const from = fromHeader?.value || "";
      const to = toHeader?.value || "";

      // Build References header for proper threading
      const newReferences = references ? `${references} ${originalMessageId}` : originalMessageId;

      // Create email with proper threading headers
      const email = [
        `Content-Type: ${isHtml ? "text/html" : "text/plain"}; charset="UTF-8"`,
        "MIME-Version: 1.0",
        `Subject: ${subject.startsWith("Re:") ? subject : `Re: ${subject}`}`,
        `To: ${from}`,
        `References: ${newReferences}`,
        `In-Reply-To: ${originalMessageId}`,
        "",
        body,
      ].join("\r\n");

      const raw = Buffer.from(email).toString("base64url");

      const response = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw,
          threadId: originalMessage.threadId,
        },
      });

      return response.data.id!;
    } catch (error) {
      console.error("Failed to reply to email:", error);
      throw error;
    }
  }
}
