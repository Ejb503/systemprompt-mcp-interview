import { CreateMessageResult } from "@modelcontextprotocol/sdk/types.js";
import { sendJsonResultNotification, sendOperationNotification } from "./notifications.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import { server } from "../server.js";
import { InterviewPlanResponse, CVSummaryResponse } from "../types/sampling-schemas.js";

/**
 * Handles sending an email via SystemPrompt API
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleConfigureInterviewCallback(
  result: CreateMessageResult,
): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  const interviewPlan = JSON.parse(result.content.text) as InterviewPlanResponse;

  if (
    !interviewPlan.interviewId ||
    !interviewPlan.interviewPlan ||
    !interviewPlan.metadata ||
    !interviewPlan.systemPromptMetadata
  ) {
    throw new Error("Invalid interview plan format");
  }

  const blockData = {
    content: result.content.text,
    prefix: interviewPlan.systemPromptMetadata.prefix,
    metadata: {
      title: interviewPlan.systemPromptMetadata.title,
      description: interviewPlan.systemPromptMetadata.description,
      tag: interviewPlan.systemPromptMetadata.tag,
    },
  };
  await sendJsonResultNotification(JSON.stringify(blockData));

  // Save to SystemPrompt as a block with correct types
  const systemprompt = SystemPromptService.getInstance();
  await systemprompt.createBlock(blockData);

  const message = `Successfully created interview plan ${interviewPlan.interviewId} with ${interviewPlan.metadata.totalQuestions} questions`;
  await sendOperationNotification("configure_interview", message);
  return message;
}

/**
 * Handles saving the CV summary to SystemPrompt
 * @param result The LLM result
 * @returns The tool response
 */
export async function handleSummarizeCVCallback(result: CreateMessageResult): Promise<string> {
  if (result.content.type !== "text") {
    throw new Error("Expected text content");
  }

  let cvSummary;
  try {
    cvSummary = JSON.parse(result.content.text) as CVSummaryResponse;
    if (
      !cvSummary.personalInfo ||
      !cvSummary.skills ||
      !cvSummary.metadata ||
      !cvSummary.systemPromptMetadata
    ) {
      throw new Error("Invalid CV summary format");
    }
  } catch (error) {
    throw new Error("Invalid CV summary format");
  }

  const blockData = {
    content: result.content.text,
    prefix: cvSummary.systemPromptMetadata.prefix,
    metadata: {
      title: cvSummary.systemPromptMetadata.title,
      description: cvSummary.systemPromptMetadata.description,
      tag: cvSummary.systemPromptMetadata.tag,
    },
  };

  await sendJsonResultNotification(JSON.stringify(blockData));

  // Save to SystemPrompt as a block
  const systemprompt = SystemPromptService.getInstance();
  await systemprompt.createBlock(blockData);
  server.sendResourceListChanged();
  const message = `Successfully processed CV summary for ${cvSummary.metadata.primaryDomain} role`;
  await sendOperationNotification("summarize_cv", message);
  return message;
}
