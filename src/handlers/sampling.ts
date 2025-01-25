import type { CreateMessageRequest, CreateMessageResult } from "@modelcontextprotocol/sdk/types.js";
import { validateRequest } from "../utils/validation.js";
import { server } from "../server.js";
import {
  handleSendEmailCallback,
  handleReplyEmailCallback,
  handleReplyDraftCallback,
  handleEditDraftCallback,
} from "./callbacks.js";

export async function sendSamplingRequest(
  request: CreateMessageRequest,
): Promise<CreateMessageResult> {
  try {
    validateRequest(request);
    const result = await server.createMessage(request.params);

    const callback = request.params._meta?.callback;
    if (callback && typeof callback === "string") {
      await handleCallback(callback, result);
    }
    return result;
  } catch (error) {
    console.error("Sampling request failed:", error instanceof Error ? error.message : error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to process sampling request: ${error || "Unknown error"}`);
  }
}

/**
 * Handles a callback based on its type
 * @param callback The callback type
 * @param result The LLM result
 * @returns The tool response
 */
async function handleCallback(callback: string, result: CreateMessageResult): Promise<string> {
  switch (callback) {
    case "send_email":
      return handleSendEmailCallback(result);
    case "reply_email":
      return handleReplyEmailCallback(result);
    case "reply_draft":
      return handleReplyDraftCallback(result);
    case "edit_draft":
      return handleEditDraftCallback(result);
    default:
      throw new Error(`Unknown callback type: ${callback}`);
  }
}
