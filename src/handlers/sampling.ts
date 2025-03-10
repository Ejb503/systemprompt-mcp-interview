import type { CreateMessageRequest, CreateMessageResult } from "@modelcontextprotocol/sdk/types.js";
import { validateRequest } from "../utils/validation.js";
import { server } from "../server.js";
import { handleConfigureInterviewCallback, handleSummarizeCVCallback } from "./callbacks.js";
import { sendOperationNotification } from "./notifications.js";

export async function sendSamplingRequest(
  request: CreateMessageRequest,
): Promise<CreateMessageResult> {
  try {
    validateRequest(request);
    await sendOperationNotification("sampling1", JSON.stringify(request));
    const result = await server.createMessage(request.params);
    await sendOperationNotification("sampling2", JSON.stringify(result));

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
  try {
    await sendOperationNotification(callback, `Callback started: ${callback}`);
    switch (callback) {
      case "configure_interview":
        return await handleConfigureInterviewCallback(result);
      case "summarize_cv":
        return await handleSummarizeCVCallback(result);
      default:
        throw new Error(`Unknown callback type: ${callback}`);
    }
  } catch (error) {
    await sendOperationNotification(
      callback,
      `Callback failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    throw error;
  }
}
