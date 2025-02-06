import {
  CallToolRequest,
  CallToolResult,
  ListToolsRequest,
  ListToolsResult,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOLS } from "../constants/tools.js";
import {
  ConfigureInterviewArgs,
  SummarizeCVArgs,
  InitiateInterviewArgs,
} from "../types/tool-schemas.js";
import { TOOL_ERROR_MESSAGES } from "../constants/tools.js";
import { sendSamplingRequest } from "./sampling.js";
import { injectVariables } from "../utils/message-handlers.js";
import { CONFIGURE_INTERVIEW_PROMPT, SUMMARIZE_CV_PROMPT } from "../constants/sampling-prompts.js";
import { handleGetPrompt } from "./prompt-handlers.js";
import { handleResourceCall } from "./resource-handlers.js";
import { handleListResources } from "./resource-handlers.js";

export async function handleListTools(request: ListToolsRequest): Promise<ListToolsResult> {
  return { tools: TOOLS };
}

export async function handleToolCall(request: CallToolRequest): Promise<CallToolResult> {
  try {
    switch (request.params.name) {
      case "configure_interview": {
        const { title, description, notes, cv } = request.params
          .arguments as unknown as ConfigureInterviewArgs;

        try {
          const resource = await handleResourceCall({
            method: "resources/read",
            params: {
              uri: cv,
            },
          });

          if (!resource?.contents?.[0]?.text) {
            throw new Error(`${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} Invalid CV resource format`);
          }

          const cvSummary = resource.contents[0].text as string;
          const prompt = await handleGetPrompt({
            method: "prompts/get",
            params: {
              name: CONFIGURE_INTERVIEW_PROMPT.name,
              arguments: { title, description, notes: notes ?? "", cv: cvSummary },
            },
          });

          const responseSchema = prompt._meta?.responseSchema;
          if (!responseSchema) {
            throw new Error(`${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} No response schema found`);
          }

          await sendSamplingRequest({
            method: "sampling/createMessage",
            params: {
              messages: CONFIGURE_INTERVIEW_PROMPT.messages.map((msg) =>
                injectVariables(msg, {
                  title,
                  description,
                  notes: notes ?? "",
                  cv: cvSummary,
                }),
              ) as Array<{
                role: "user" | "assistant";
                content: { type: "text"; text: string };
              }>,
              maxTokens: 100000,
              temperature: 0.7,
              _meta: {
                callback: "configure_interview",
                responseSchema: responseSchema,
              },
              arguments: { title, description, notes: notes ?? "", cv: cvSummary },
            },
          });

          return {
            content: [
              {
                type: "text",
                text: "Interview configuration started, please wait...",
              },
            ],
          };
        } catch (error) {
          console.error(`Error configuring interview: ${error}`);
          throw new Error(`${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} ${error}`);
        }
      }

      case "summarize_cv": {
        const { cv } = request.params.arguments as unknown as SummarizeCVArgs;

        const prompt = await handleGetPrompt({
          method: "prompts/get",
          params: {
            name: SUMMARIZE_CV_PROMPT.name,
            arguments: { cv },
          },
        });

        const responseSchema = prompt._meta?.responseSchema;
        if (!responseSchema) {
          throw new Error(`${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} No response schema found`);
        }

        await sendSamplingRequest({
          method: "sampling/createMessage",
          params: {
            messages: SUMMARIZE_CV_PROMPT.messages.map((msg) =>
              injectVariables(msg, { cv }),
            ) as Array<{
              role: "user" | "assistant";
              content: { type: "text"; text: string };
            }>,
            maxTokens: 100000,
            temperature: 0.5,
            _meta: {
              callback: "summarize_cv",
              responseSchema: responseSchema,
            },
            arguments: { cv },
          },
        });

        return {
          content: [
            {
              type: "text",
              text: "CV analysis started, please wait...",
            },
          ],
        };
      }

      case "initiate_interview": {
        const { interviewUri } = request.params.arguments as unknown as InitiateInterviewArgs;

        try {
          const resource = await handleResourceCall({
            method: "resources/read",
            params: {
              uri: interviewUri,
            },
          });

          if (!resource?.contents?.[0]?.text) {
            throw new Error(
              `${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} Invalid interview resource format`,
            );
          }

          return {
            content: [
              {
                type: "text",
                text: `Initializing interview with data:\n${resource.contents[0].text}`,
              },
            ],
          };
        } catch (error) {
          console.error(`Error initiating interview: ${error}`);
          throw new Error(`${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} ${error}`);
        }
      }

      case "list_interviews": {
        try {
          const resources = await handleListResources({
            method: "resources/list",
            params: {
              filter: {
                tags: ["mcp_systemprompt_interview", "interview"],
              },
            },
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(resources.resources, null, 2),
              },
            ],
            _meta: {
              timestamp: Date.now(),
            },
          };
        } catch (error) {
          console.error(`Error listing interviews: ${error}`);
          throw new Error(`${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} ${error}`);
        }
      }

      case "list_cvs": {
        try {
          const resources = await handleListResources({
            method: "resources/list",
            params: {
              filter: {
                tags: ["mcp_systemprompt_interview", "cv"],
              },
            },
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(resources.resources, null, 2),
              },
            ],
            _meta: {
              timestamp: Date.now(),
            },
          };
        } catch (error) {
          console.error(`Error listing CVs: ${error}`);
          throw new Error(`${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} ${error}`);
        }
      }

      default:
        throw new Error(`${TOOL_ERROR_MESSAGES.UNKNOWN_TOOL} ${request.params.name}`);
    }
  } catch (error) {
    console.error(`${TOOL_ERROR_MESSAGES.TOOL_CALL_FAILED} ${error}`);
    throw error;
  }
}
