import { Implementation, ServerCapabilities } from "@modelcontextprotocol/sdk/types.js";

export const serverConfig: Implementation = {
  name: "systemprompt-mcp-interview",
  version: "1.0.5",
  metadata: {
    name: "System Prompt MCP Interview",
    description:
      "A specialized Model Context Protocol (MCP) server that conducts mock interviews, provides feedback, and helps users practice their interview skills with AI-powered interview scenarios.",
    icon: "solar:users-group-rounded-line-duotone",
    color: "primary",
    serverStartTime: Date.now(),
    environment: process.env.NODE_ENV,
    customData: {
      serverFeatures: ["agent", "prompts", "systemprompt", "interviews"],
    },
  },
};

export const serverCapabilities: { capabilities: ServerCapabilities } = {
  capabilities: {
    resources: {
      listChanged: true,
    },
    tools: {},
    prompts: {
      listChanged: true,
    },
    sampling: {},
    logging: {},
  },
};
