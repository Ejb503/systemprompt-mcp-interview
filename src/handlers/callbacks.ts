import { CreateMessageResult } from "@modelcontextprotocol/sdk/types.js";
import { sendOperationNotification } from "./notifications.js";
import { GmailService } from "../services/gmail-service.js";

/**
 * Handles sending an email via Gmail API
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleSendEmailCallback(result: CreateMessageResult): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const emailRequest = JSON.parse(result.content.text);
  const gmail = new GmailService();
  const messageId = await gmail.sendEmail(emailRequest);

  const message = `Successfully sent email with id: ${messageId}`;
  await sendOperationNotification("send_email", message);
  return message;
}

/**
 * Handles replying to an email via Gmail API
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleReplyEmailCallback(result: CreateMessageResult): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const emailRequest = JSON.parse(result.content.text);
  const gmail = new GmailService();
  const messageId = await gmail.replyEmail(
    emailRequest.replyTo,
    emailRequest.body,
    emailRequest.isHtml,
  );

  const message = `Successfully sent reply with id: ${messageId}`;
  await sendOperationNotification("reply_email", message);
  return message;
}

/**
 * Handles creating a draft reply via Gmail API
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleReplyDraftCallback(result: CreateMessageResult): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const emailRequest = JSON.parse(result.content.text);
  const gmail = new GmailService();
  const draftId = await gmail.createDraft({
    ...emailRequest,
    replyTo: emailRequest.replyTo,
  });

  const message = `Successfully created draft reply with id: ${draftId}`;
  await sendOperationNotification("reply_draft", message);
  return message;
}

/**
 * Handles editing a draft via Gmail API
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleEditDraftCallback(result: CreateMessageResult): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const emailRequest = JSON.parse(result.content.text);
  const gmail = new GmailService();
  const draftId = await gmail.updateDraft({
    ...emailRequest,
    id: emailRequest.draftId,
  });

  const message = `Successfully updated draft with id: ${draftId}`;
  await sendOperationNotification("edit_draft", message);
  return message;
}
