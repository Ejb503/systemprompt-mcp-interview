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
    name: "gmail_list_messages",
    description: "Lists recent Gmail messages from the user's inbox with optional filtering.",
    inputSchema: {
      type: "object",
      properties: {
        maxResults: { type: "number" },
        after: { type: "string" },
        before: { type: "string" },
        sender: { type: "string" },
        to: { type: "string" },
        subject: { type: "string" },
        hasAttachment: { type: "boolean" },
        label: { type: "string" },
        _message: { type: "string" },
      },
    },
  },
  {
    name: "gmail_get_message",
    description: "Retrieves the full content of a specific Gmail message by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        messageId: { type: "string" },
        _message: { type: "string" },
      },
      required: ["messageId"],
    },
  },
  {
    name: "gmail_search_messages",
    description: "Searches Gmail messages using Gmail's search syntax.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        maxResults: { type: "number" },
        after: { type: "string" },
        before: { type: "string" },
        _message: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    name: "gmail_list_labels",
    description: "Lists all Gmail labels in the user's account.",
    inputSchema: {
      type: "object",
      properties: {
        _message: { type: "string" },
      },
    },
  },
  {
    name: "gmail_send_email",
    description: "Sends an email with optional attachments, CC, and BCC recipients.",
    inputSchema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description:
            "Recipient email address(es). Multiple addresses can be comma-separated. Must be a valid email address",
        },
        userInstructions: {
          type: "string",
          description: "Detailed user instructions for an AI system to generate a HTML email",
        },
      },
      required: ["to", "userInstructions"],
    },
  },
  {
    name: "gmail_create_draft",
    description: "Creates a draft email that can be edited and sent later.",
    inputSchema: {
      type: "object",
      properties: {
        to: { type: "string" },
        subject: { type: "string" },
        body: { type: "string" },
        cc: { type: "string" },
        bcc: { type: "string" },
        isHtml: { type: "boolean" },
      },
      required: ["to", "subject", "body"],
    },
  },
  {
    name: "gmail_list_drafts",
    description: "Lists all draft emails in the user's account.",
    inputSchema: {
      type: "object",
      properties: {
        maxResults: { type: "number" },
      },
    },
  },
  {
    name: "gmail_delete_draft",
    description: "Deletes a draft email by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        draftId: { type: "string" },
        _message: { type: "string" },
      },
      required: ["draftId"],
    },
  },
  {
    name: "gmail_trash_message",
    description: "Moves a Gmail message to the trash by its ID.",
    inputSchema: {
      type: "object",
      properties: {
        messageId: { type: "string" },
        _message: { type: "string" },
      },
      required: ["messageId"],
    },
  },
];
