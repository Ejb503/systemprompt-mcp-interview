import { JSONSchema7 } from "json-schema";

export const EMAIL_SEARCH_RESPONSE_SCHEMA: JSONSchema7 = {
  type: "object",
  properties: {
    maxResults: {
      type: "number",
      description: "Maximum number of messages to return. Defaults to 10.",
    },
    after: {
      type: "string",
      description: "Return messages after this date (format: YYYY/MM/DD).",
    },
    before: {
      type: "string",
      description: "Return messages before this date (format: YYYY/MM/DD).",
    },
    sender: {
      type: "string",
      description: "Filter messages from this sender email address.",
    },
    to: {
      type: "string",
      description: "Filter messages sent to this recipient email address.",
    },
    subject: {
      type: "string",
      description: "Filter messages containing this text in the subject line.",
    },
    hasAttachment: {
      type: "boolean",
      description: "Filter messages that have attachments.",
    },
    label: {
      type: "string",
      description: "Filter messages with this Gmail label.",
    },
  },
};

export const EMAIL_DRAFT_RESPONSE_SCHEMA: JSONSchema7 = {
  type: "object",
  properties: {
    to: {
      type: "string",
      description: "Recipient email address(es). Multiple addresses can be comma-separated.",
    },
    subject: {
      type: "string",
      description: "Email subject line.",
    },
    body: {
      type: "string",
      description: "Email body content. Can be plain text or HTML.",
    },
    cc: {
      type: "string",
      description: "CC recipient email address(es). Multiple addresses can be comma-separated.",
    },
    bcc: {
      type: "string",
      description: "BCC recipient email address(es). Multiple addresses can be comma-separated.",
    },
    isHtml: {
      type: "boolean",
      description: "Whether the body content is HTML. Defaults to false for plain text.",
    },
  },
  required: ["to", "subject", "body"],
};

export const EMAIL_SEND_RESPONSE_SCHEMA: JSONSchema7 = {
  type: "object",
  properties: {
    to: {
      type: "string",
      description: "Recipient email address(es). Multiple addresses can be comma-separated.",
    },
    subject: {
      type: "string",
      description: "Email subject line.",
    },
    body: {
      type: "string",
      description: "Email body content. Must be valid HTML.",
    },
    cc: {
      type: "string",
      description: "CC recipient email address(es). Multiple addresses can be comma-separated.",
    },
    bcc: {
      type: "string",
      description: "BCC recipient email address(es). Multiple addresses can be comma-separated.",
    },
    isHtml: {
      type: "boolean",
      description: "Whether the body content is HTML. Defaults to false for plain text.",
    },
    replyTo: {
      type: "string",
      description: "Reply-to email address.",
    },
    attachments: {
      type: "array",
      description: "List of attachments to include in the email.",
      items: {
        type: "object",
        properties: {
          filename: {
            type: "string",
            description: "Name of the attachment file.",
          },
          content: {
            type: "string",
            description: "Content of the attachment (base64 encoded for binary files).",
          },
          contentType: {
            type: "string",
            description: "MIME type of the attachment.",
          },
        },
        required: ["filename", "content"],
      },
    },
  },
  required: ["to", "subject", "body"],
};
