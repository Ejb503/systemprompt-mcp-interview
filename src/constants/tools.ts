import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const TOOL_ERROR_MESSAGES = {
  UNKNOWN_TOOL: "Unknown tool:",
  TOOL_CALL_FAILED: "Tool call failed:",
} as const;

export const TOOL_RESPONSE_MESSAGES = {
  ASYNC_PROCESSING: "Request is being processed asynchronously",
} as const;

export const TOOLS: Tool[] = [
  {
    name: "configure_interview",
    description: "Configure an interview with a candidate.",
    inputSchema: {
      type: "object",
      properties: {
        cv: {
          type: "string",
          description:
            "The CV of the candidate. For best results, paste the results of the summarize CV tool.",
        },
        description: {
          type: "string",
          description: "The job description for the interview.",
        },
        title: {
          type: "string",
          description: "The title of the job for the interview.",
        },
        notes: {
          type: "string",
          description: "Any additional notes about the candidate or the interview.",
        },
      },
    },
    required: ["cv", "description", "title"],
  },
  {
    name: "summarize_cv",
    description: "Extract structured information from a CV in text format.",
    inputSchema: {
      type: "object",
      properties: {
        cv: {
          type: "string",
          description: "The CV text content to analyze and structure.",
        },
      },
      required: ["cv"],
    },
  },
  {
    name: "initiate_interview",
    description: "Initiate an interview using a configured interview resource.",
    inputSchema: {
      type: "object",
      properties: {
        interviewUri: {
          type: "string",
          description:
            "URI of the configured interview resource. Must be a valid resource URI in format `resource:///block/6a84a378-bcf6-44e5-a14c-027219521f38`",
        },
      },
      required: ["interviewUri"],
    },
  },
  {
    name: "list_interviews",
    description: "List all available interview configurations.",
    inputSchema: {
      type: "object",

      properties: {
        limit: {
          type: "number",
          description: "Maximum number of interviews to return",
        },
      },
    },
  },
  {
    name: "list_cvs",
    description: "List all available CV resources.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of CVs to return",
        },
      },
    },
  },
];
