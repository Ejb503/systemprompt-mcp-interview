#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { handleListResources, handleResourceCall } from "./handlers/resource-handlers.js";
import { handleListTools, handleToolCall } from "./handlers/tool-handlers.js";
import { handleListPrompts, handleGetPrompt } from "./handlers/prompt-handlers.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  CallToolRequestSchema,
  CreateMessageRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "dotenv";
import { SystemPromptService } from "./services/systemprompt-service.js";
import { sendSamplingRequest } from "./handlers/sampling.js";
import { server } from "./server.js";
import { GoogleAuthService } from "./services/google-auth-service.js";

export async function main() {
  config();

  const apiKey = process.env.SYSTEMPROMPT_API_KEY;
  if (!apiKey) {
    throw new Error("SYSTEMPROMPT_API_KEY environment variable is required");
  }
  const token = process.env.GOOGLE_TOKEN;
  const credentials = process.env.GOOGLE_CREDENTIALS;
  if (!token || !credentials) {
    throw new Error("GOOGLE_TOKEN and GOOGLE_CREDENTIALS environment variables are required");
  }
  SystemPromptService.initialize();

  // Initialize Google Auth
  const googleAuth = GoogleAuthService.getInstance();
  await googleAuth.initialize();

  server.setRequestHandler(ListResourcesRequestSchema, handleListResources);
  server.setRequestHandler(ReadResourceRequestSchema, handleResourceCall);
  server.setRequestHandler(ListToolsRequestSchema, handleListTools);
  server.setRequestHandler(CallToolRequestSchema, handleToolCall);
  server.setRequestHandler(ListPromptsRequestSchema, handleListPrompts);
  server.setRequestHandler(GetPromptRequestSchema, handleGetPrompt);
  server.setRequestHandler(CreateMessageRequestSchema, sendSamplingRequest);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Run the server unless in test environment
if (process.env.NODE_ENV !== "test") {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
