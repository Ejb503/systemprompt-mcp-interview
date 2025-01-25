import {
  ReadResourceRequest,
  ListResourcesResult,
  ReadResourceResult,
  ListResourcesRequest,
} from "@modelcontextprotocol/sdk/types.js";

const AGENT_RESOURCE = {
  name: "Systemprompt default",
  description:
    "An expert agent for Gmail, Calendar management and task organization",
  instruction: `You are a specialized agent with deep expertise in email management, calendar organization, and task coordination. Your capabilities include:

1. Email Management (Gmail):
- List, search, and analyze email messages
- Send emails and manage drafts
- Handle attachments and labels
- Process email content intelligently

2. Calendar Operations:
- Schedule and manage meetings
- Analyze calendar availability
- Track events and deadlines
- Identify scheduling conflicts

3. Task Organization:
- Create and manage todo lists
- Prioritize tasks effectively
- Track deadlines and progress
- Optimize task workflows

4. Smart Communication:
- Compose well-structured emails
- Analyze communication patterns
- Maintain professional tone
- Handle multi-participant coordination

You have access to specialized tools and prompts for each of these areas. Always select the most appropriate tool for the task and execute operations efficiently while maintaining high quality and reliability.`,
  voice: "Kore",
  config: {
    model: "models/gemini-2.0-flash-exp",
    generationConfig: {
      responseModalities: "audio",
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Kore",
          },
        },
      },
    },
  },
};

export async function handleListResources(
  request: ListResourcesRequest
): Promise<ListResourcesResult> {
  return {
    resources: [
      {
        uri: "resource:///block/default",
        name: AGENT_RESOURCE.name,
        description: AGENT_RESOURCE.description,
        mimeType: "text/plain",
      },
    ],
    _meta: {},
  };
}

export async function handleResourceCall(
  request: ReadResourceRequest
): Promise<ReadResourceResult> {
  const { uri } = request.params;
  const match = uri.match(/^resource:\/\/\/block\/(.+)$/);

  if (!match) {
    throw new Error(
      "Invalid resource URI format - expected resource:///block/{id}"
    );
  }

  const blockId = match[1];
  if (blockId !== "default") {
    throw new Error("Resource not found");
  }

  return {
    contents: [
      {
        uri: uri,
        mimeType: "text/plain",
        text: JSON.stringify({
          name: AGENT_RESOURCE.name,
          description: AGENT_RESOURCE.description,
          instruction: AGENT_RESOURCE.instruction,
          voice: AGENT_RESOURCE.voice,
          config: AGENT_RESOURCE.config,
        }),
      },
    ],
    _meta: { tag: ["agent"] },
  };
}
