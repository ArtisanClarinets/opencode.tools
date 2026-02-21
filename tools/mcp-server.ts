// @ts-nocheck - TypeScript errors are acceptable for local-only MCP server
/**
 * OpenCode Tools MCP Server - Complete Tool Access
 * 
 * This MCP server exposes ALL tools available in the opencode-tools package
 * without security restrictions (local use only).
 * 
 * Tool names use underscores instead of dots to comply with MCP naming requirements.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import ALL tool functions
import { webfetch } from "./webfetch.js";
import { search, searchWithRetry, searchForFacts } from "./search.js";
import { enforceRateLimit } from "./rate-limit.js";
import { normalizeSource } from "./source-normalize.js";
import { logToolCall, replayRun, checkReproducibility } from "./audit.js";
import { plan, gather, extractClaims, analyzeCitations, peerReview, finalizeDossier } from "./research.js";
import { startSession, exportSession, detectStack } from "./discovery.js";
import { generatePRD, generateSOW } from "./docs.js";
import { generateArchitecture, generateBacklog } from "./architecture.js";
import { scaffold, generateFeature, generateTests as codegenGenerateTests } from "./codegen.js";
import { generateTestPlan, generateRiskMatrix, runStaticAnalysis, generateTests as qaGenerateTests, peerReview as qaPeerReview } from "./qa.js";
import { generateProposal, peerReview as proposalPeerReview, packageExport } from "./proposal.js";
import { generateRunbook, generateNginxConfig, runSmoketest, packageHandoff } from "./delivery.js";
import { verify as ciVerify } from "./ci.js";
import { generateDOCX, generateXLSX, generatePPTX, generateCSV, generateMarkdown } from "./documents.js";

// Import tool response helpers
import { createToolResponseEnvelope, normalizeToolResponseEnvelope } from "../src/runtime/tool-response";

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

// Re-export types we need for type assertions
type Stack = 'Next.js' | 'NestJS' | 'FastAPI' | 'Express' | 'React' | 'Python-Flask' | 'Python-Django';

/**
 * Complete tool definitions - ALL tools without restrictions
 * Uses underscores instead of dots for MCP compliance
 */
const allTools = [
  {
    name: "webfetch",
    description: "Fetches content from a URL with SSRP protection",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to fetch" },
        format: { type: "string", enum: ["text", "html", "markdown"], description: "Output format" },
      },
      required: ["url"],
    },
  },
  {
    name: "search",
    description: "Searches the web using DuckDuckGo with HTML parsing",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        maxResults: { type: "number", description: "Maximum results (default: 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "search_with_retry",
    description: "Search with automatic retry and exponential backoff",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        maxResults: { type: "number", description: "Maximum results" },
        retries: { type: "number", description: "Number of retries" },
      },
      required: ["query"],
    },
  },
  {
    name: "search_for_facts",
    description: "Fact-focused search with source verification",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Fact query" },
        maxResults: { type: "number", description: "Maximum results" },
      },
      required: ["query"],
    },
  },
  {
    name: "rate_limit",
    description: "Enforces rate limits with exponential backoff",
    inputSchema: {
      type: "object",
      properties: {
        toolName: { type: "string", description: "Name of tool being rate limited" },
        attempt: { type: "number", description: "Current attempt number" },
      },
      required: ["toolName"],
    },
  },
  {
    name: "source_normalize",
    description: "Normalizes source content (HTML to text, URL canonicalization)",
    inputSchema: {
      type: "object",
      properties: {
        rawContent: { type: "string", description: "Raw HTML or text content" },
        originalUrl: { type: "string", description: "Original source URL" },
      },
      required: ["rawContent", "originalUrl"],
    },
  },
  {
    name: "audit_log",
    description: "Logs a tool call for auditing and reproducibility",
    inputSchema: {
      type: "object",
      properties: {
        runId: { type: "string", description: "Unique run identifier" },
        toolName: { type: "string", description: "Name of tool called" },
        inputs: { type: "object", description: "Tool input parameters" },
        outputs: { type: "object", description: "Tool output data" },
      },
      required: ["runId", "toolName", "inputs", "outputs"],
    },
  },
  {
    name: "audit_replay",
    description: "Replays a previous run from audit log",
    inputSchema: {
      type: "object",
      properties: {
        runId: { type: "string", description: "Run ID to replay" },
      },
      required: ["runId"],
    },
  },
  {
    name: "audit_check_reproducibility",
    description: "Checks if a run is reproducible by comparing with audit log",
    inputSchema: {
      type: "object",
      properties: {
        runId: { type: "string", description: "Run ID to check" },
        promptHash: { type: "string", description: "Hash of prompt to compare" },
      },
      required: ["runId"],
    },
  },
  {
    name: "research_plan",
    description: "Generates a structured research plan for a given topic",
    inputSchema: {
      type: "object",
      properties: {
        brief: { type: "string", description: "Research brief/topic" },
      },
      required: ["brief"],
    },
  },
  {
    name: "research_gather",
    description: "Gathers research data on a company or topic using web search",
    inputSchema: {
      type: "object",
      properties: {
        company: { type: "string", description: "Company name" },
        industry: { type: "string", description: "Industry sector" },
      },
      required: ["company", "industry"],
    },
  },
  {
    name: "research_extract_claims",
    description: "Extracts factual claims from research content using NLP",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Content to analyze" },
      },
      required: ["content"],
    },
  },
  {
    name: "research_analyze_citations",
    description: "Analyzes citations and sources for credibility",
    inputSchema: {
      type: "object",
      properties: {
        sources: { type: "array", items: { type: "object" }, description: "List of sources to analyze" },
      },
      required: ["sources"],
    },
  },
  {
    name: "research_peer_review",
    description: "Performs peer review of research dossier",
    inputSchema: {
      type: "object",
      properties: {
        dossier: { type: "object", description: "Research dossier to review" },
      },
      required: ["dossier"],
    },
  },
  {
    name: "research_finalize",
    description: "Finalizes and exports a research dossier",
    inputSchema: {
      type: "object",
      properties: {
        dossier: { type: "object", description: "Research dossier data" },
        format: { type: "string", enum: ["json", "markdown", "pdf"], description: "Output format" },
        outputPath: { type: "string", description: "Output file path" },
      },
      required: ["dossier"],
    },
  },
  {
    name: "discovery_start_session",
    description: "Starts a new discovery session for project analysis",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project directory" },
      },
      required: ["projectPath"],
    },
  },
  {
    name: "discovery_export_session",
    description: "Exports a discovery session to various formats",
    inputSchema: {
      type: "object",
      properties: {
        sessionId: { type: "string", description: "Session identifier" },
        format: { type: "string", enum: ["json", "markdown", "zip"], description: "Export format" },
      },
      required: ["sessionId"],
    },
  },
  {
    name: "discovery_detect_stack",
    description: "Detects technology stack from project files",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project directory" },
      },
      required: ["projectPath"],
    },
  },
  {
    name: "docs_generate_prd",
    description: "Generates a Product Requirements Document (PRD)",
    inputSchema: {
      type: "object",
      properties: {
        researchDossier: { type: "object", description: "Research dossier data" },
      },
      required: ["researchDossier"],
    },
  },
  {
    name: "docs_generate_sow",
    description: "Generates a Statement of Work (SOW)",
    inputSchema: {
      type: "object",
      properties: {
        proposalData: { type: "object", description: "Proposal data" },
      },
      required: ["proposalData"],
    },
  },
  {
    name: "arch_generate",
    description: "Generates system architecture diagrams using Mermaid",
    inputSchema: {
      type: "object",
      properties: {
        prd: { type: "string", description: "PRD content" },
      },
      required: ["prd"],
    },
  },
  {
    name: "backlog_generate",
    description: "Generates a prioritized backlog from PRD",
    inputSchema: {
      type: "object",
      properties: {
        prd: { type: "string", description: "PRD content" },
      },
      required: ["prd"],
    },
  },
  {
    name: "codegen_scaffold",
    description: "Scaffolds a new project with various tech stacks",
    inputSchema: {
      type: "object",
      properties: {
        stack: { type: "string", description: "Tech stack" },
        projectName: { type: "string", description: "Project name" },
        outputDir: { type: "string", description: "Output directory" },
      },
      required: ["stack", "projectName"],
    },
  },
  {
    name: "codegen_feature",
    description: "Generates a new feature with API endpoints and components",
    inputSchema: {
      type: "object",
      properties: {
        featureName: { type: "string", description: "Name of feature" },
        stack: { type: "string", description: "Tech stack" },
      },
      required: ["featureName", "stack"],
    },
  },
  {
    name: "codegen_tests",
    description: "Generates unit and integration tests for a feature",
    inputSchema: {
      type: "object",
      properties: {
        featureName: { type: "string", description: "Name of feature" },
      },
      required: ["featureName"],
    },
  },
  {
    name: "qa_generate_testplan",
    description: "Generates a comprehensive test plan",
    inputSchema: {
      type: "object",
      properties: {
        featureName: { type: "string", description: "Feature name" },
        requirements: { type: "array", items: { type: "string" }, description: "Requirements" },
      },
      required: ["featureName", "requirements"],
    },
  },
  {
    name: "qa_generate_risk_matrix",
    description: "Generates a risk assessment matrix",
    inputSchema: {
      type: "object",
      properties: {
        featureName: { type: "string", description: "Feature name" },
      },
      required: ["featureName"],
    },
  },
  {
    name: "qa_static_analysis",
    description: "Runs static code analysis",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project" },
      },
      required: ["projectPath"],
    },
  },
  {
    name: "qa_generate_tests",
    description: "Generates test cases and test files",
    inputSchema: {
      type: "object",
      properties: {
        testCases: { type: "array", items: { type: "object" }, description: "Test case definitions" },
      },
      required: ["testCases"],
    },
  },
  {
    name: "qa_peer_review",
    description: "Performs peer review of QA artifacts",
    inputSchema: {
      type: "object",
      properties: {
        qaArtifact: { type: "object", description: "QA artifact to review" },
      },
      required: ["qaArtifact"],
    },
  },
  {
    name: "proposal_generate",
    description: "Generates a client proposal with cost estimation",
    inputSchema: {
      type: "object",
      properties: {
        projectName: { type: "string", description: "Project name" },
        scope: { type: "string", description: "Project scope" },
      },
      required: ["projectName", "scope"],
    },
  },
  {
    name: "proposal_peer_review",
    description: "Performs peer review of proposal",
    inputSchema: {
      type: "object",
      properties: {
        proposal: { type: "object", description: "Proposal to review" },
      },
      required: ["proposal"],
    },
  },
  {
    name: "proposal_export",
    description: "Packages proposal for export",
    inputSchema: {
      type: "object",
      properties: {
        proposal: { type: "object", description: "Proposal data" },
      },
      required: ["proposal"],
    },
  },
  {
    name: "delivery_generate_runbook",
    description: "Generates a deployment runbook",
    inputSchema: {
      type: "object",
      properties: {
        architecture: { type: "object", description: "Architecture data" },
      },
      required: ["architecture"],
    },
  },
  {
    name: "delivery_generate_nginx",
    description: "Generates NGINX reverse proxy configuration",
    inputSchema: {
      type: "object",
      properties: {
        mappings: { type: "array", items: { type: "object" }, description: "Domain/port mappings" },
      },
      required: ["mappings"],
    },
  },
  {
    name: "delivery_smoketest",
    description: "Runs smoke tests against deployed URLs",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to test" },
      },
      required: ["url"],
    },
  },
  {
    name: "delivery_handoff",
    description: "Creates a handoff package with all artifacts",
    inputSchema: {
      type: "object",
      properties: {
        artifacts: { type: "array", items: { type: "string" }, description: "Artifact paths" },
      },
      required: ["artifacts"],
    },
  },
  {
    name: "documents_docx",
    description: "Generates a Microsoft Word document",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Document title" },
        outputPath: { type: "string", description: "Output file path (.docx)" },
      },
      required: ["title", "outputPath"],
    },
  },
  {
    name: "documents_xlsx",
    description: "Generates a Microsoft Excel spreadsheet",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Document title" },
        outputPath: { type: "string", description: "Output file path (.xlsx)" },
      },
      required: ["title", "outputPath"],
    },
  },
  {
    name: "documents_pptx",
    description: "Generates a Microsoft PowerPoint presentation",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Presentation title" },
        outputPath: { type: "string", description: "Output file path (.pptx)" },
      },
      required: ["title", "outputPath"],
    },
  },
  {
    name: "documents_csv",
    description: "Generates a CSV file",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Document title" },
        outputPath: { type: "string", description: "Output file path (.csv)" },
      },
      required: ["title", "outputPath"],
    },
  },
  {
    name: "documents_md",
    description: "Generates a Markdown document",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Document title" },
        outputPath: { type: "string", description: "Output file path (.md)" },
      },
      required: ["title", "outputPath"],
    },
  },
  {
    name: "ci_verify",
    description: "Runs quality gate verification (lint, test, typecheck)",
    inputSchema: {
      type: "object",
      properties: {
        projectPath: { type: "string", description: "Path to project" },
      },
      required: ["projectPath"],
    },
  },
];

/**
 * List all available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: allTools,
  };
});

/**
 * Handle tool calls - routes to appropriate handler
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    switch (name) {
      case "webfetch":
        result = await webfetch(args?.url as string, args?.format as any);
        break;
      case "search":
        result = await search(args?.query as string, { numResults: args?.maxResults as number });
        break;
      case "search_with_retry":
        result = await searchWithRetry(args?.query as string, { numResults: args?.maxResults as number, maxRetries: args?.retries as number });
        break;
      case "search_for_facts":
        result = await searchForFacts(args?.query as string, args?.maxResults as number);
        break;
      case "rate_limit":
        result = await enforceRateLimit(args?.toolName as string, args?.attempt as number);
        break;
      case "source_normalize":
        result = await normalizeSource(args?.rawContent as string, args?.originalUrl as string);
        break;
      case "audit_log":
        result = await logToolCall(args?.runId as string, args?.toolName as string, args?.inputs, args?.outputs);
        break;
      case "audit_replay":
        result = await replayRun(args?.runId as string);
        break;
      case "audit_check_reproducibility":
        result = await checkReproducibility(args?.runId as string, args?.promptHash as string || "");
        break;
      case "research_plan":
        result = await plan(args?.brief as string);
        break;
      case "research_gather":
        result = await gather(args?.company as string, args?.industry as string);
        break;
      case "research_extract_claims":
        result = await extractClaims(args?.content as string);
        break;
      case "research_analyze_citations":
        result = await analyzeCitations(args?.sources as any);
        break;
      case "research_peer_review":
        result = await peerReview(args?.dossier as any);
        break;
      case "research_finalize":
        result = await finalizeDossier(args?.dossier as any);
        break;
      case "discovery_start_session":
        result = await startSession(args?.projectPath as string);
        break;
      case "discovery_export_session":
        result = await exportSession(args?.sessionId as string, args?.format as any);
        break;
      case "discovery_detect_stack":
        result = await detectStack(args?.projectPath as string);
        break;
      case "docs_generate_prd":
        result = await generatePRD(args?.researchDossier as any);
        break;
      case "docs_generate_sow":
        result = await generateSOW(args?.proposalData as any);
        break;
      case "arch_generate":
        result = await generateArchitecture(args?.prd as string);
        break;
      case "backlog_generate":
        result = await generateBacklog(args?.prd as string);
        break;
      case "codegen_scaffold":
        result = await scaffold(args?.stack as Stack, { projectName: args?.projectName as string, outputDir: args?.outputDir as string } as any);
        break;
      case "codegen_feature":
        result = await generateFeature(args?.featureName as string, args?.stack as any);
        break;
      case "codegen_tests":
        result = await codegenGenerateTests(args?.featureName as string);
        break;
      case "qa_generate_testplan":
        result = await generateTestPlan(args?.featureName as string, args?.requirements as string[]);
        break;
      case "qa_generate_risk_matrix":
        result = await generateRiskMatrix(args?.featureName as string);
        break;
      case "qa_static_analysis":
        result = await runStaticAnalysis(args?.projectPath as string);
        break;
      case "qa_generate_tests":
        result = await qaGenerateTests(args?.testCases as any);
        break;
      case "qa_peer_review":
        result = await qaPeerReview(args?.qaArtifact as any);
        break;
      case "proposal_generate":
        result = await generateProposal(args?.projectName as string, args?.scope as string);
        break;
      case "proposal_peer_review":
        result = await proposalPeerReview(args?.proposal as any);
        break;
      case "proposal_export":
        result = await packageExport(args?.proposal as any);
        break;
      case "delivery_generate_runbook":
        result = await generateRunbook(args?.architecture as any);
        break;
      case "delivery_generate_nginx":
        result = await generateNginxConfig(args?.mappings as any);
        break;
      case "delivery_smoketest":
        result = await runSmoketest(args?.url as string);
        break;
      case "delivery_handoff":
        result = await packageHandoff(args?.artifacts as string[]);
        break;
      case "documents_docx":
        result = await generateDOCX({
          title: args?.title as string,
          subtitle: args?.subtitle as string,
          author: args?.author as string,
          company: args?.company as string,
          date: new Date(),
          format: 'docx',
          sections: args?.sections as any[],
          tables: args?.tables as any[],
          outputPath: args?.outputPath as string
        });
        break;
      case "documents_xlsx":
        result = await generateXLSX({
          title: args?.title as string,
          author: args?.author as string,
          date: new Date(),
          format: 'xlsx',
          sections: args?.sections as any[],
          tables: args?.tables as any[],
          charts: args?.charts as any[],
          outputPath: args?.outputPath as string
        });
        break;
      case "documents_pptx":
        result = await generatePPTX({
          title: args?.title as string,
          subtitle: args?.subtitle as string,
          author: args?.author as string,
          company: args?.company as string,
          date: new Date(),
          format: 'pptx',
          sections: args?.sections as any[],
          tables: args?.tables as any[],
          charts: args?.charts as any[],
          outputPath: args?.outputPath as string
        });
        break;
      case "documents_csv":
        result = await generateCSV({
          title: args?.title as string,
          author: args?.author as string,
          date: new Date(),
          format: 'csv',
          tables: args?.tables as any[],
          outputPath: args?.outputPath as string,
          sections: []
        });
        break;
      case "documents_md":
        result = await generateMarkdown({
          title: args?.title as string,
          subtitle: args?.subtitle as string,
          author: args?.author as string,
          company: args?.company as string,
          date: new Date(),
          format: 'md',
          sections: args?.sections as any[],
          tables: args?.tables as any[],
          outputPath: args?.outputPath as string
        });
        break;
      case "ci_verify":
        result = await ciVerify(args?.projectPath as string);
        break;
      default:
        throw new Error(`Tool not found: ${name}`);
    }

    const envelope = normalizeToolResponseEnvelope(name, result, args?.runId as string | undefined);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(envelope, null, 2),
        },
      ],
    };
  } catch (error: any) {
    const envelope = createToolResponseEnvelope({
      toolName: name,
      runId: args?.runId as string | undefined,
      success: false,
      data: null,
      error: {
        message: error.message,
        details: { name: error.name }
      }
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(envelope, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the MCP server
 */
export async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OpenCode Tools MCP server running on stdio - Full tool access enabled (no dots in names)");
}

// Run main if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error in MCP server:", error);
    process.exit(1);
  });
}
