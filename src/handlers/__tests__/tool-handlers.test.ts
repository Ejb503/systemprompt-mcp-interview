import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import { handleToolCall } from "../tool-handlers.js";
import type {
  SystempromptPromptResponse,
  SystempromptUserStatusResponse,
} from "../../types/systemprompt.js";

interface UserStatus {
  user: {
    name: string;
    email: string;
    roles: string[];
  };
  billing: {
    customer: {
      id: string;
      email: string;
      status: string;
    };
    subscription: Array<{
      id: string;
      status: string;
      currency_code: string;
      billing_cycle: {
        frequency: number;
        interval: string;
      };
      current_billing_period: {
        starts_at: string;
        ends_at: string;
      };
      items: Array<{
        product: { name: string };
        price: {
          unit_price: { amount: string; currency_code: string };
        };
      }>;
    }>;
  };
  api_key: string;
}

interface MockPrompt {
  id: string;
  metadata: {
    title: string;
    description: string;
  };
  content: string;
}

// Mock the main function
jest.mock("../../index.ts", () => ({
  main: jest.fn(),
  server: {
    notification: jest.fn().mockImplementation(async () => {}),
  },
}));

// Mock the sampling module
jest.mock("../sampling.js", () => ({
  sendSamplingRequest: jest.fn().mockImplementation(async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({ metadata: { title: "Test", description: "Test" }, content: "Test" }),
      },
    ],
  })),
}));

// Mock SystemPromptService
const mockUserStatus: SystempromptUserStatusResponse = {
  user: {
    id: "user123",
    uuid: "uuid123",
    name: "Test User",
    email: "test@example.com",
    roles: ["user"],
    paddle_id: "paddle123",
  },
  content: {
    prompt: 0,
    artifact: 0,
    block: 0,
    conversation: 0,
  },
  usage: {
    ai: {
      execution: 0,
      token: 0,
    },
    api: {
      generation: 0,
    },
  },
  billing: {
    customer: {
      id: "cust123",
      name: null,
      email: "test@example.com",
      marketingConsent: false,
      status: "active",
      customData: null,
      locale: "en",
      createdAt: {
        date: "2024-01-01T00:00:00Z",
        timezone_type: 3,
        timezone: "UTC",
      },
      updatedAt: {
        date: "2024-01-01T00:00:00Z",
        timezone_type: 3,
        timezone: "UTC",
      },
      importMeta: null,
    },
    subscription: [
      {
        id: "sub123",
        status: "active",
        currency_code: "USD",
        billing_cycle: {
          frequency: 1,
          interval: "month",
        },
        current_billing_period: {
          starts_at: "2024-01-01",
          ends_at: "2024-02-01",
        },
        items: [
          {
            product: { name: "Test Product" },
            price: {
              unit_price: { amount: "10.00", currency_code: "USD" },
            },
          },
        ],
      },
    ],
  },
  api_key: "test-api-key",
};

const mockSystemPromptService = {
  fetchUserStatus: jest.fn().mockResolvedValue(mockUserStatus),
  getAllPrompts: jest.fn().mockResolvedValue([]),
  listBlocks: jest.fn().mockResolvedValue([]),
  listAgents: jest.fn().mockResolvedValue([]),
  deletePrompt: jest.fn().mockResolvedValue(undefined),
  deleteBlock: jest.fn().mockResolvedValue(undefined),
};

jest.mock("../../services/systemprompt-service.js", () => ({
  SystemPromptService: jest.fn(() => mockSystemPromptService),
}));

const mockPrompt: MockPrompt = {
  id: "prompt123",
  metadata: {
    title: "Test Prompt",
    description: "A test prompt",
  },
  content: "Test content",
};

const mockBlock: MockPrompt = {
  id: "block123",
  metadata: {
    title: "Test Block",
    description: "A test block",
  },
  content: "Test content",
};

const mockAgent: MockPrompt = {
  id: "agent123",
  metadata: {
    title: "Test Agent",
    description: "A test agent",
  },
  content: "Test content",
};

// Mock the server config
jest.mock("../../config/server-config.js", () => ({
  serverConfig: {
    port: 3000,
    host: "localhost",
  },
  serverCapabilities: {
    tools: [],
  },
}));

describe("Tool Handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handleToolCall", () => {
    describe("Heartbeat", () => {
      it("should handle systemprompt_heartbeat", async () => {
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_heartbeat",
            params: {},
          },
        };

        const result = await handleToolCall(request);
        expect(mockSystemPromptService.fetchUserStatus).toHaveBeenCalled();
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toContain("User Information");
      });

      it("should handle errors gracefully", async () => {
        const error = new Error("Failed to fetch user status");
        mockSystemPromptService.fetchUserStatus.mockRejectedValueOnce(error);
        const request: CallToolRequest = {
          method: "tools/call",
          params: {
            name: "systemprompt_heartbeat",
            params: {},
          },
        };
        await expect(handleToolCall(request)).rejects.toThrow("Failed to fetch user status");
      });
    });

    describe("Resource Operations", () => {
      it("should handle systemprompt_fetch_resources", async () => {
        const result = await handleToolCall({
          method: "tools/call",
          params: {
            name: "systemprompt_fetch_resources",
            params: {},
          },
        });
        expect(mockSystemPromptService.getAllPrompts).toHaveBeenCalled();
        expect(mockSystemPromptService.listBlocks).toHaveBeenCalled();
        expect(mockSystemPromptService.listAgents).toHaveBeenCalled();
        expect(result.content[0].type).toBe("text");
        expect(result.content[0].text).toContain("Resources");
      });

      it("should handle delete resource failure", async () => {
        mockSystemPromptService.deletePrompt.mockRejectedValueOnce(
          new Error("Failed to delete prompt"),
        );
        mockSystemPromptService.deleteBlock.mockRejectedValueOnce(
          new Error("Failed to delete block"),
        );
        await expect(
          handleToolCall({
            method: "tools/call",
            params: {
              name: "systemprompt_delete_resource",
              arguments: {
                id: "nonexistent123",
              },
            },
          }),
        ).rejects.toThrow("Failed to delete resource with ID nonexistent123");
      });
    });

    describe("Error Handling", () => {
      it("should handle invalid tool name", async () => {
        await expect(
          handleToolCall({
            method: "tools/call",
            params: {
              name: "invalid_tool",
              params: {},
            },
          }),
        ).rejects.toThrow("Unknown tool: invalid_tool");
      });

      it("should handle service errors", async () => {
        mockSystemPromptService.fetchUserStatus.mockRejectedValueOnce(new Error("Service error"));
        await expect(
          handleToolCall({
            method: "tools/call",
            params: {
              name: "systemprompt_heartbeat",
              params: {},
            },
          }),
        ).rejects.toThrow("Service error");
      });
    });
  });
});

afterEach(() => {
  jest.resetModules();
});

describe("Heartbeat", () => {
  const mockUserStatus: UserStatus = {
    user: {
      email: "test@example.com",
      status: "active",
    },
    subscription: [
      {
        id: "sub123",
        status: "active",
        currency_code: "USD",
        billing_cycle: {
          frequency: 1,
          interval: "month",
        },
        current_billing_period: {
          starts_at: "2024-01-01T00:00:00Z",
          ends_at: "2024-02-01T00:00:00Z",
        },
        items: [
          {
            product: { name: "Pro Plan" },
            price: {
              unit_price: { amount: "1000", currency_code: "USD" },
            },
          },
        ],
      },
    ],
  };

  let mockSamplingModule: { sendSamplingRequest: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSamplingModule = require("../sampling.js");
    mockSamplingModule.sendSamplingRequest.mockImplementation(async () => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            metadata: {
              title: "Test Resource",
              description: "A test resource",
            },
            content: "Test content",
          }),
        },
      ],
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  it("should handle systemprompt_heartbeat", async () => {
    const result = await handleToolCall({
      method: "tools/call",
      params: {
        name: "systemprompt_heartbeat",
        params: {},
      },
    });
    expect(result.content[0].text).toContain("User Information");
    expect(result.content[0].text).toContain("Billing");
  });

  it("should handle empty subscription list in heartbeat", async () => {
    mockSystemPromptService.fetchUserStatus.mockResolvedValueOnce({
      user: {
        name: "Test User",
        email: "test@example.com",
        roles: ["user"],
      },
      billing: {
        customer: {
          id: "cust123",
          email: "test@example.com",
          status: "active",
        },
        subscription: [],
      },
      api_key: "test-api-key",
    });
    const result = await handleToolCall({
      method: "tools/call",
      params: {
        name: "systemprompt_heartbeat",
        params: {},
      },
    });
    expect(result.content[0].text).toContain("Billing");
  });

  it("should handle empty resource lists in fetch resources", async () => {
    mockSystemPromptService.getAllPrompts.mockResolvedValueOnce([]);
    mockSystemPromptService.listBlocks.mockResolvedValueOnce([]);
    mockSystemPromptService.listAgents.mockResolvedValueOnce([]);
    const result = await handleToolCall({
      method: "tools/call",
      params: {
        name: "systemprompt_fetch_resources",
        params: {},
      },
    });
    expect(result.content[0].text).toContain("Prompts");
    expect(result.content[0].text).toContain("Agents");
    expect(result.content[0].text).toContain("Prompts");
    expect(result.content[0].text).toContain("Resources");
  });
});

describe("Resource Operations", () => {
  it("should handle systemprompt_fetch_resources", async () => {
    const result = await handleToolCall({
      method: "tools/call",
      params: {
        name: "systemprompt_fetch_resources",
        params: {},
      },
    });
    expect(mockSystemPromptService.getAllPrompts).toHaveBeenCalled();
    expect(mockSystemPromptService.listBlocks).toHaveBeenCalled();
    expect(mockSystemPromptService.listAgents).toHaveBeenCalled();
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Agents");
    expect(result.content[0].text).toContain("Prompts");
    expect(result.content[0].text).toContain("Resources");
  });

  it("should handle create resource request", async () => {
    const result = await handleToolCall({
      method: "tools/call",
      params: {
        name: "systemprompt_create_resource",
        arguments: {
          type: "block",
          userInstructions: "Create a test block",
        },
      },
    });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(
      "Your request has been recieved and is being processed, we will notify you when it is complete.",
    );
  });

  it("should handle update resource request", async () => {
    const result = await handleToolCall({
      method: "tools/call",
      params: {
        name: "systemprompt_update_resource",
        arguments: {
          id: "test-id",
          type: "block",
          userInstructions: "Update test block",
        },
      },
    });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe(
      "Your request has been recieved and is being processed, we will notify you when it is complete.",
    );
  });

  it("should handle systemprompt_delete_resource", async () => {
    const result = await handleToolCall({
      method: "tools/call",
      params: {
        name: "systemprompt_delete_resource",
        arguments: {
          id: "test-id",
        },
      },
    });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe("Successfully deleted prompt test-id");
  });

  it("should handle invalid resource type for create", async () => {
    await expect(
      handleToolCall({
        method: "tools/call",
        params: {
          name: "systemprompt_create_resource",
          arguments: {
            type: "invalid",
            userInstructions: "Create an invalid resource",
          },
        },
      }),
    ).rejects.toThrow("Invalid resource type: invalid");
  });

  it("should handle invalid resource type for update", async () => {
    await expect(
      handleToolCall({
        method: "tools/call",
        params: {
          name: "systemprompt_update_resource",
          arguments: {
            id: "test-id",
            type: "invalid",
            userInstructions: "Update an invalid resource",
          },
        },
      }),
    ).rejects.toThrow("Invalid resource type: invalid");
  });

  it("should handle missing id for delete resource", async () => {
    await expect(
      handleToolCall({
        method: "tools/call",
        params: {
          name: "systemprompt_delete_resource",
          arguments: {},
        },
      }),
    ).rejects.toThrow("ID is required for deleting a resource");
  });

  it("should handle invalid params for create resource", async () => {
    await expect(
      handleToolCall({
        method: "tools/call",
        params: {
          name: "systemprompt_create_resource",
          arguments: {},
        },
      }),
    ).rejects.toThrow(
      "Tool call failed: Missing required parameters - type and userInstructions are required",
    );
  });

  it("should handle invalid params for update resource", async () => {
    await expect(
      handleToolCall({
        method: "tools/call",
        params: {
          name: "systemprompt_update_resource",
          arguments: {},
        },
      }),
    ).rejects.toThrow(
      "Tool call failed: Missing required parameters - id, type and userInstructions are required",
    );
  });

  it("should handle successful block deletion", async () => {
    const result = await handleToolCall({
      method: "tools/call",
      params: {
        name: "systemprompt_delete_resource",
        arguments: {
          id: "test-block-id",
        },
      },
    });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe("Successfully deleted prompt test-block-id");
  });
});

describe("Error Handling", () => {
  it("should handle invalid tool name", async () => {
    await expect(
      handleToolCall({
        method: "tools/call",
        params: {
          name: "invalid_tool",
          params: {},
        },
      }),
    ).rejects.toThrow("Unknown tool: invalid_tool");
  });

  it("should handle service errors", async () => {
    mockSystemPromptService.fetchUserStatus.mockRejectedValueOnce(new Error("Service error"));
    await expect(
      handleToolCall({
        method: "tools/call",
        params: {
          name: "systemprompt_heartbeat",
          params: {},
        },
      }),
    ).rejects.toThrow("Service error");
  });
});
