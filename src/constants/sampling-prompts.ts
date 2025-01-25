import { SamplingPrompt } from "../types/sampling.js";
import {
  EMAIL_SEARCH_INSTRUCTIONS,
  EMAIL_DRAFT_INSTRUCTIONS,
  EMAIL_SEND_INSTRUCTIONS,
} from "./instructions.js";
import {
  EMAIL_SEARCH_RESPONSE_SCHEMA,
  EMAIL_DRAFT_RESPONSE_SCHEMA,
  EMAIL_SEND_RESPONSE_SCHEMA,
} from "../types/sampling-schemas.js";

const promptArgs = [
  {
    name: "userInstructions",
    description: "Instructions for the email operation",
    required: true,
  },
];

// Email Search Prompt
export const SEARCH_EMAIL_PROMPT: SamplingPrompt = {
  name: "SearchEmail",
  description: "Searches through emails based on user criteria",
  arguments: promptArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: EMAIL_SEARCH_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `<input><userInstructions>{{userInstructions}}</userInstructions></input>`,
      },
    },
  ],
  _meta: {
    callback: "search_email",
    responseSchema: EMAIL_SEARCH_RESPONSE_SCHEMA,
  },
};

// Email Draft Prompt
export const CREATE_EMAIL_DRAFT_PROMPT: SamplingPrompt = {
  name: "CreateEmailDraft",
  description: "Creates a new email draft based on user instructions",
  arguments: promptArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: EMAIL_DRAFT_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `<input><userInstructions>{{userInstructions}}</userInstructions></input>`,
      },
    },
  ],
  _meta: {
    callback: "create_email_draft",
    responseSchema: EMAIL_DRAFT_RESPONSE_SCHEMA,
  },
};

// Email Send Prompt
export const SEND_EMAIL_PROMPT: SamplingPrompt = {
  name: "gmail_send_email",
  description: "Sends an email based on user instructions",
  arguments: promptArgs,
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: EMAIL_SEND_INSTRUCTIONS,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `<input><userInstructions>{{userInstructions}}</userInstructions><to>{{to}}</to></input>`,
      },
    },
  ],
  _meta: {
    callback: "send_email",
    responseSchema: EMAIL_SEND_RESPONSE_SCHEMA,
  },
};

// Export all prompts
export const PROMPTS = [SEARCH_EMAIL_PROMPT, CREATE_EMAIL_DRAFT_PROMPT, SEND_EMAIL_PROMPT];
