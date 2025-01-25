import {
  Implementation,
  ServerCapabilities,
} from "@modelcontextprotocol/sdk/types.js";

export const serverConfig: Implementation = {
  name: "systemprompt-mcp-google",
  version: "1.0.0",
  metadata: {
    name: "System Prompt Google Integration Server",
    description:
      "MCP server providing seamless integration with Google services. Enables AI agents to interact with Gmail, Google Calendar, and other Google APIs through a secure, standardized interface.",
    icon: "mdi:google",
    color: "blue",
    serverStartTime: Date.now(),
    environment: process.env.NODE_ENV,
    customData: {
      serverFeatures: ["google-mail", "google-calendar", "oauth2"],
      supportedAPIs: ["gmail", "calendar"],
      authProvider: "google-oauth2",
      requiredScopes: [
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/calendar",
      ],
    },
  },
};

export const serverCapabilities: { capabilities: ServerCapabilities } = {
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
};
