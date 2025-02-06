import {
  ReadResourceRequest,
  ListResourcesResult,
  ReadResourceResult,
  ListResourcesRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { SystemPromptService } from "../services/systemprompt-service.js";
import {
  mapBlockToReadResourceResult,
  mapBlocksToListResourcesResult,
} from "../utils/mcp-mappers.js";

interface ListResourcesFilter {
  tags?: string[];
}

interface ListResourcesParams {
  filter?: ListResourcesFilter;
}

export async function handleListResources(
  request: ListResourcesRequest,
): Promise<ListResourcesResult> {
  try {
    const service = SystemPromptService.getInstance();
    const params = request.params as ListResourcesParams;

    const blocks = await service.listBlocks(
      params?.filter?.tags ? { tags: params.filter.tags } : undefined,
    );

    const blockResources = mapBlocksToListResourcesResult(blocks);

    return {
      _meta: {
        timestamp: Date.now(),
      },
      resources: blockResources.resources,
    };
  } catch (error: any) {
    console.error("Failed to fetch resources:", error);
    throw new Error(
      `Failed to fetch resources from systemprompt.io: ${error.message || "Unknown error"}`,
    );
  }
}

export async function handleResourceCall(
  request: ReadResourceRequest,
): Promise<ReadResourceResult> {
  if (!request.params?.uri) {
    throw new Error("No URI provided in request params");
  }

  try {
    const service = SystemPromptService.getInstance();
    const { uri } = request.params;

    const blockMatch = uri.match(/^resource:\/\/\/block\/(.+)$/);

    if (!blockMatch) {
      throw new Error(
        "Invalid resource URI format - expected resource:///block/{id} or resource:///agent/{id}",
      );
    }

    if (blockMatch) {
      const blockId = blockMatch[1];
      const block = await service.getBlock(blockId);
      return mapBlockToReadResourceResult(block);
    }
    throw new Error("Failed to process resource request");
  } catch (error: any) {
    console.error("Failed to fetch resource:", error);
    throw new Error(
      `Failed to fetch resource from systemprompt.io: ${error.message || "Unknown error"}`,
    );
  }
}
