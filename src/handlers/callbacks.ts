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
