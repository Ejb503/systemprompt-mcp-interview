import type {
  SystempromptPromptResponse,
  SystempromptBlockResponse,
  SystempromptAgentResponse,
  SystempromptUserStatusResponse,
} from "../types/systemprompt.js";

export class SystemPromptService {
  private static instance: SystemPromptService | null = null;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = "https://api.systemprompt.io/v1";
  }

  public static initialize(): void {
    if (!SystemPromptService.instance) {
      SystemPromptService.instance = new SystemPromptService();
    }
  }

  public static getInstance(): SystemPromptService {
    if (!SystemPromptService.instance) {
      throw new Error("SystemPromptService must be initialized first");
    }
    return SystemPromptService.instance;
  }

  public static cleanup(): void {
    SystemPromptService.instance = null;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    try {
      const url = `${this.baseUrl}${path}`;
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.SYSTEMPROMPT_API_KEY as string,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : undefined;
      } catch (error) {
        throw new Error("Failed to parse API response");
      }

      if (!response.ok) {
        switch (response.status) {
          case 403:
            throw new Error("Invalid API key");
          case 404:
            throw new Error("Resource not found - it may have been deleted");
          default:
            throw new Error(data?.message || "API request failed");
        }
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to make API request");
    }
  }

  public async getAllPrompts(): Promise<SystempromptPromptResponse[]> {
    return this.request<SystempromptPromptResponse[]>("GET", "/prompts");
  }

  public async listBlocks(): Promise<SystempromptBlockResponse[]> {
    return this.request<SystempromptBlockResponse[]>("GET", "/blocks");
  }

  public async listAgents(): Promise<SystempromptAgentResponse[]> {
    return this.request<SystempromptAgentResponse[]>("GET", "/agents");
  }

  public async fetchUserStatus(): Promise<SystempromptUserStatusResponse> {
    return this.request<SystempromptUserStatusResponse>("GET", "/user/status");
  }

  public async deletePrompt(id: string): Promise<void> {
    await this.request<void>("DELETE", `/prompts/${id}`);
  }

  public async deleteBlock(id: string): Promise<void> {
    await this.request<void>("DELETE", `/blocks/${id}`);
  }
}
