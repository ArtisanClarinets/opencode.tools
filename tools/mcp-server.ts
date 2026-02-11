import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { webfetch } from "./webfetch.js";
import { search } from "./search.js";
import { enforceRateLimit } from "./rate-limit.js";
import { normalizeSource } from "./source-normalize.js";
import { logToolCall, replayRun, checkReproducibility } from "./audit.js";

const server = new Server(
  {
    name: "opencode-tools",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "webfetch",
        description: "Fetches content from a URL",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string" },
            format: { type: "string", enum: ["text", "html", "markdown"] },
          },
          required: ["url"],
        },
      },
      {
        name: "search",
        description: "Searches the web",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
          },
          required: ["query"],
        },
      },
      {
        name: "rate-limit",
        description: "Enforces rate limits",
        inputSchema: {
          type: "object",
          properties: {
            toolName: { type: "string" },
            attempt: { type: "number" },
          },
          required: ["toolName"],
        },
      },
      {
        name: "source-normalize",
        description: "Normalizes source content",
        inputSchema: {
          type: "object",
          properties: {
            rawContent: { type: "string" },
            originalUrl: { type: "string" },
          },
          required: ["rawContent", "originalUrl"],
        },
      },
      {
        name: "audit.logToolCall",
        description: "Logs a tool call for auditing",
        inputSchema: {
          type: "object",
          properties: {
            runId: { type: "string" },
            toolName: { type: "string" },
            inputs: { type: "object" },
            outputs: { type: "object" },
          },
          required: ["runId", "toolName", "inputs", "outputs"],
        },
      },
      {
        name: "research.plan",
        description: "Generates a research plan (Placeholder)",
        inputSchema: {
          type: "object",
          properties: {
            topic: { type: "string" },
          },
          required: ["topic"],
        },
      }
      // Add more as needed
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case "webfetch":
        result = await webfetch(args?.url as string, args?.format as any);
        break;
      case "search":
        result = await search(args?.query as string, args);
        break;
      case "rate-limit":
        result = await enforceRateLimit(args?.toolName as string, args?.attempt as number);
        break;
      case "source-normalize":
        result = await normalizeSource(args?.rawContent as string, args?.originalUrl as string);
        break;
      case "audit.logToolCall":
        result = await logToolCall(args?.runId as string, args?.toolName as string, args?.inputs, args?.outputs);
        break;
      case "research.plan":
        result = { success: true, content: "Research plan generated for " + args?.topic };
        break;
      default:
        throw new Error(`Tool not found: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OpenCode Tools MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in MCP server:", error);
  process.exit(1);
});
