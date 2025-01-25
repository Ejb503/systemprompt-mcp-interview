import { GmailService } from "../services/gmail-service.js";
import {
  CallToolRequest,
  CallToolResult,
  ListToolsRequest,
  ListToolsResult,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOLS } from "../constants/tools.js";
import { ListMessagesArgs, GetMessageArgs, SearchMessagesArgs } from "../types/tool-schemas.js";
import { TOOL_ERROR_MESSAGES } from "../constants/tools.js";
import { sendSamplingRequest } from "./sampling.js";
import { handleGetPrompt } from "./prompt-handlers.js";
import { injectVariables } from "../utils/message-handlers.js";
import { DraftEmailOptions } from "../types/gmail-types.js";

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

export async function handleListTools(request: ListToolsRequest): Promise<ListToolsResult> {
  return { tools: TOOLS };
}

export async function handleToolCall(request: CallToolRequest): Promise<CallToolResult> {
  try {
    switch (request.params.name) {
      // Gmail Tools
      case "gmail_list_messages": {
        const gmail = new GmailService();
        const args = request.params.arguments as unknown as ListMessagesArgs;
        const messages = await gmail.listMessages(args.maxResults);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(messages, null, 2),
            },
          ],
        };
      }

      case "gmail_get_message": {
        const gmail = new GmailService();
        const args = request.params.arguments as unknown as GetMessageArgs;
        const message = await gmail.getMessage(args.messageId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(message, null, 2),
            },
          ],
        };
      }

      case "gmail_search_messages": {
        const gmail = new GmailService();
        const args = request.params.arguments as unknown as SearchMessagesArgs;
        const messages = await gmail.searchMessages(args.query, args.maxResults);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(messages, null, 2),
            },
          ],
        };
      }

      case "gmail_list_labels": {
        const gmail = new GmailService();
        const labels = await gmail.getLabels();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(labels, null, 2),
            },
          ],
        };
      }
      case "gmail_send_email": {
        const { userInstructions, to } = request.params.arguments as {
          userInstructions: string;
          to: string;
        };
        if (!userInstructions) {
          throw new Error(
            "Tool call failed: Missing required parameters - userInstructions is required",
          );
        }

        if (!to) {
          throw new Error("Tool call failed: Missing required parameters - to is required");
        }

        validateEmailList(to);

        const prompt = await handleGetPrompt({
          method: "prompts/get",
          params: {
            name: "gmail_send_email",
            arguments: { userInstructions, to },
          },
        });

        if (!prompt._meta?.responseSchema) {
          throw new Error("Invalid prompt configuration: missing response schema");
        }

        await sendSamplingRequest({
          method: "sampling/createMessage",
          params: {
            messages: prompt.messages.map((msg) =>
              injectVariables(msg, { userInstructions, to }),
            ) as Array<{
              role: "user" | "assistant";
              content: { type: "text"; text: string };
            }>,
            maxTokens: 100000,
            temperature: 0.7,
            _meta: {
              callback: "send_email",
              responseSchema: prompt._meta.responseSchema,
            },
            arguments: { userInstructions, to },
          },
        });
        return {
          content: [
            {
              type: "text",
              text: `Your request has been received and is being processed, we will notify you when it is complete.`,
            },
          ],
        };
      }
      case "gmail_create_draft": {
        const gmail = new GmailService();
        const args = request.params.arguments as unknown as DraftEmailOptions;
        const draftId = await gmail.createDraft({
          to: args.to,
          subject: args.subject,
          body: args.body,
          cc: args.cc,
          bcc: args.bcc,
          isHtml: args.isHtml,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                draftId,
                status: "Draft created successfully",
              }),
            },
          ],
        };
      }

      case "gmail_list_drafts": {
        const gmail = new GmailService();
        const drafts = await gmail.listDrafts();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(drafts, null, 2),
            },
          ],
        };
      }

      case "gmail_delete_draft": {
        const gmail = new GmailService();
        const args = request.params.arguments as unknown as { draftId: string };
        await gmail.deleteDraft(args.draftId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "Draft deleted successfully",
              }),
            },
          ],
        };
      }

      case "gmail_trash_message": {
        const gmail = new GmailService();
        const args = request.params.arguments as unknown as { messageId: string };
        await gmail.trashMessage(args.messageId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "Message moved to trash successfully",
              }),
            },
          ],
        };
      }

      default:
        throw new Error(`${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`);
    }
  } catch (error) {
    console.error(`${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} ${error}`);
    throw error;
  }
}
