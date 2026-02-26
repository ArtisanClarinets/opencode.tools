/**
 * MCP Tool Registry - Single source of truth for all available tools
 */

import { ToolDefinition } from './defs';
import * as schemas from './schemas';
import * as wrappers from './wrappers';

// Canonical tool definitions
const CANONICAL_TOOLS: ToolDefinition[] = [
  // Web tools
  {
    name: 'webfetch',
    description: 'Fetch content from a web URL',
    inputSchema: schemas.WEBFETCH_SCHEMA
  },
  {
    name: 'search',
    description: 'Perform a web search',
    inputSchema: schemas.SEARCH_SCHEMA
  },
  {
    name: 'searchWithRetry',
    description: 'Perform a web search with retry logic',
    inputSchema: schemas.SEARCH_WITH_RETRY_SCHEMA
  },
  {
    name: 'searchForFacts',
    description: 'Search for factual information',
    inputSchema: schemas.SEARCH_FOR_FACTS_SCHEMA
  },
  
  // Rate limiting and normalization
  {
    name: 'enforceRateLimit',
    description: 'Enforce rate limiting for tools',
    inputSchema: schemas.ENFORCE_RATE_LIMIT_SCHEMA
  },
  {
    name: 'normalizeSource',
    description: 'Normalize source content',
    inputSchema: schemas.NORMALIZE_SOURCE_SCHEMA
  },
  
  // Audit tools
  {
    name: 'logToolCall',
    description: 'Log a tool call for audit purposes',
    inputSchema: schemas.LOG_TOOL_CALL_SCHEMA
  },
  {
    name: 'replayRun',
    description: 'Replay a previous run',
    inputSchema: schemas.REPLAY_RUN_SCHEMA
  },
  {
    name: 'checkReproducibility',
    description: 'Check reproducibility of a run',
    inputSchema: schemas.CHECK_REPRODUCIBILITY_SCHEMA
  },
  
  // Research tools
  {
    name: 'researchPlan',
    description: 'Create a research plan',
    inputSchema: schemas.RESEARCH_PLAN_SCHEMA
  },
  {
    name: 'researchGather',
    description: 'Gather research data',
    inputSchema: schemas.RESEARCH_GATHER_SCHEMA
  },
  {
    name: 'researchClaimsExtract',
    description: 'Extract claims from content',
    inputSchema: schemas.RESEARCH_CLAIMS_EXTRACT_SCHEMA
  },
  {
    name: 'researchCitationsAnalyze',
    description: 'Analyze citations',
    inputSchema: schemas.RESEARCH_CITATIONS_ANALYZE_SCHEMA
  },
  {
    name: 'researchPeerReview',
    description: 'Peer review research',
    inputSchema: schemas.RESEARCH_PEER_REVIEW_SCHEMA
  },
  {
    name: 'researchDossierFinalize',
    description: 'Finalize research dossier',
    inputSchema: schemas.RESEARCH_DOSSIER_FINALIZE_SCHEMA
  },
  
  // Discovery tools
  {
    name: 'startSession',
    description: 'Start a discovery session',
    inputSchema: schemas.START_SESSION_SCHEMA
  },
  {
    name: 'exportSession',
    description: 'Export a discovery session',
    inputSchema: schemas.EXPORT_SESSION_SCHEMA
  },
  {
    name: 'detectStack',
    description: 'Detect technology stack',
    inputSchema: schemas.DETECT_STACK_SCHEMA
  },
  
  // Documentation tools
  {
    name: 'generatePRD',
    description: 'Generate Product Requirements Document',
    inputSchema: schemas.GENERATE_PRD_SCHEMA
  },
  {
    name: 'generateSOW',
    description: 'Generate Statement of Work',
    inputSchema: schemas.GENERATE_SOW_SCHEMA
  },
  
  // Architecture tools
  {
    name: 'generateArchitecture',
    description: 'Generate system architecture',
    inputSchema: schemas.GENERATE_ARCHITECTURE_SCHEMA
  },
  {
    name: 'generateBacklog',
    description: 'Generate project backlog',
    inputSchema: schemas.GENERATE_BACKLOG_SCHEMA
  },
  
  // Code generation tools
  {
    name: 'scaffold',
    description: 'Generate code scaffold',
    inputSchema: schemas.SCAFFOLD_SCHEMA
  },
  {
    name: 'generateFeature',
    description: 'Generate feature implementation',
    inputSchema: schemas.GENERATE_FEATURE_SCHEMA
  },
  {
    name: 'codegenGenerateTests',
    description: 'Generate code tests',
    inputSchema: schemas.CODEGEN_GENERATE_TESTS_SCHEMA
  },
  
  // QA tools
  {
    name: 'generateTestPlan',
    description: 'Generate test plan',
    inputSchema: schemas.GENERATE_TEST_PLAN_SCHEMA
  },
  {
    name: 'generateRiskMatrix',
    description: 'Generate risk matrix',
    inputSchema: schemas.GENERATE_RISK_MATRIX_SCHEMA
  },
  {
    name: 'runStaticAnalysis',
    description: 'Run static analysis',
    inputSchema: schemas.RUN_STATIC_ANALYSIS_SCHEMA
  },
  {
    name: 'qaGenerateTests',
    description: 'Generate QA tests',
    inputSchema: schemas.QA_GENERATE_TESTS_SCHEMA
  },
  {
    name: 'qaPeerReview',
    description: 'Peer review QA',
    inputSchema: schemas.QA_PEER_REVIEW_SCHEMA
  },
  
  // Proposal tools
  {
    name: 'generateProposal',
    description: 'Generate proposal',
    inputSchema: schemas.GENERATE_PROPOSAL_SCHEMA
  },
  {
    name: 'proposalPeerReview',
    description: 'Peer review proposal',
    inputSchema: schemas.PROPOSAL_PEER_REVIEW_SCHEMA
  },
  {
    name: 'packageExport',
    description: 'Export package',
    inputSchema: schemas.PACKAGE_EXPORT_SCHEMA
  },
  
  // Delivery tools
  {
    name: 'generateRunbook',
    description: 'Generate deployment runbook',
    inputSchema: schemas.GENERATE_RUNBOOK_SCHEMA
  },
  {
    name: 'generateNginxConfig',
    description: 'Generate nginx configuration',
    inputSchema: schemas.GENERATE_NGINX_CONFIG_SCHEMA
  },
  {
    name: 'runSmoketest',
    description: 'Run smoke tests',
    inputSchema: schemas.RUN_SMOKETEST_SCHEMA
  },
  {
    name: 'packageHandoff',
    description: 'Package handoff',
    inputSchema: schemas.PACKAGE_HANDOFF_SCHEMA
  },
  
  // CI tools
  {
    name: 'ciVerify',
    description: 'Verify CI configuration',
    inputSchema: schemas.CI_VERIFY_SCHEMA
  },
  
  // Document generation tools
  {
    name: 'generateDocument',
    description: 'Generate document',
    inputSchema: schemas.GENERATE_DOCUMENT_SCHEMA
  },
  {
    name: 'generateDOCX',
    description: 'Generate DOCX document',
    inputSchema: schemas.GENERATE_DOCX_SCHEMA
  },
  {
    name: 'generateXLSX',
    description: 'Generate XLSX spreadsheet',
    inputSchema: schemas.GENERATE_XLSX_SCHEMA
  },
  {
    name: 'generatePPTX',
    description: 'Generate PPTX presentation',
    inputSchema: schemas.GENERATE_PPTX_SCHEMA
  },
  {
    name: 'generateCSV',
    description: 'Generate CSV file',
    inputSchema: schemas.GENERATE_CSV_SCHEMA
  },
  {
    name: 'generateMarkdown',
    description: 'Generate Markdown document',
    inputSchema: schemas.GENERATE_MARKDOWN_SCHEMA
  },
  {
    name: 'generateQuickDocument',
    description: 'Generate quick document',
    inputSchema: schemas.GENERATE_QUICK_DOCUMENT_SCHEMA
  },
  
  // Foundry tools
  {
    name: 'foundryOrchestrate',
    description: 'Orchestrate Foundry workflow',
    inputSchema: schemas.FOUNDRY_ORCHESTRATE_SCHEMA
  },
  {
    name: 'foundryStatus',
    description: 'Get Foundry status',
    inputSchema: schemas.FOUNDRY_STATUS_SCHEMA
  },
  {
    name: 'foundryHealth',
    description: 'Get Foundry health',
    inputSchema: schemas.FOUNDRY_HEALTH_SCHEMA
  },
  {
    name: 'foundryCreateRequest',
    description: 'Create Foundry request',
    inputSchema: schemas.FOUNDRY_CREATE_REQUEST_SCHEMA
  },
  
  // Gateway tools
  {
    name: 'cto_sweep',
    description: 'Perform CTO sweep',
    inputSchema: schemas.CTO_SWEEP_SCHEMA
  },
  
  // Cowork tools
  {
    name: 'coworkList',
    description: 'List cowork items',
    inputSchema: schemas.COWORK_LIST_SCHEMA
  },
  {
    name: 'coworkRun',
    description: 'Run cowork command',
    inputSchema: schemas.COWORK_RUN_SCHEMA
  },
  {
    name: 'coworkSpawn',
    description: 'Spawn cowork agent',
    inputSchema: schemas.COWORK_SPAWN_SCHEMA
  },
  {
    name: 'coworkHealth',
    description: 'Get cowork health',
    inputSchema: schemas.COWORK_HEALTH_SCHEMA
  },
  {
    name: 'coworkPlugins',
    description: 'List cowork plugins',
    inputSchema: schemas.COWORK_PLUGINS_SCHEMA
  },
  {
    name: 'coworkAgents',
    description: 'List cowork agents',
    inputSchema: schemas.COWORK_AGENTS_SCHEMA
  },
  
  // New tools
  {
    name: 'pdf_generate',
    description: 'Generate PDF document',
    inputSchema: schemas.PDF_GENERATE_SCHEMA
  },
  {
    name: 'summarization_summarize',
    description: 'Summarize content using AI',
    inputSchema: schemas.SUMMARIZATION_SUMMARIZE_SCHEMA
  },
  {
    name: 'security_scan',
    description: 'Scan for security issues',
    inputSchema: schemas.SECURITY_SCAN_SCHEMA
  },
  {
    name: 'security_redact',
    description: 'Redact sensitive information',
    inputSchema: schemas.SECURITY_REDACT_SCHEMA
  },
  {
    name: 'security_seal_evidence',
    description: 'Seal evidence with cryptographic hash',
    inputSchema: schemas.SECURITY_SEAL_EVIDENCE_SCHEMA
  },
  {
    name: 'opencode_tools_cli',
    description: 'Execute opencode-tools CLI command',
    inputSchema: schemas.OPENCODE_TOOLS_CLI_SCHEMA
  }
];

// Handler mapping
export const TOOL_HANDLERS: Record<string, (args: any) => Promise<any>> = {
  // Web tools
  webfetch: wrappers.webfetchWrapper,
  search: wrappers.searchWrapper,
  searchWithRetry: wrappers.searchWithRetryWrapper,
  searchForFacts: wrappers.searchForFactsWrapper,
  
  // Rate limiting and normalization
  enforceRateLimit: wrappers.enforceRateLimitWrapper,
  normalizeSource: wrappers.normalizeSourceWrapper,
  
  // Audit tools
  logToolCall: wrappers.logToolCallWrapper,
  replayRun: wrappers.replayRunWrapper,
  checkReproducibility: wrappers.checkReproducibilityWrapper,
  
  // Research tools
  researchPlan: wrappers.researchPlanWrapper,
  researchGather: wrappers.researchGatherWrapper,
  researchClaimsExtract: wrappers.researchClaimsExtractWrapper,
  researchCitationsAnalyze: wrappers.researchCitationsAnalyzeWrapper,
  researchPeerReview: wrappers.researchPeerReviewWrapper,
  researchDossierFinalize: wrappers.researchDossierFinalizeWrapper,
  
  // Discovery tools
  startSession: wrappers.startSessionWrapper,
  exportSession: wrappers.exportSessionWrapper,
  detectStack: wrappers.detectStackWrapper,
  
  // Documentation tools
  generatePRD: wrappers.generatePRDWrapper,
  generateSOW: wrappers.generateSOWWrapper,
  
  // Architecture tools
  generateArchitecture: wrappers.generateArchitectureWrapper,
  generateBacklog: wrappers.generateBacklogWrapper,
  
  // Code generation tools
  scaffold: wrappers.scaffoldWrapper,
  generateFeature: wrappers.generateFeatureWrapper,
  codegenGenerateTests: wrappers.codegenGenerateTestsWrapper,
  
  // QA tools
  generateTestPlan: wrappers.generateTestPlanWrapper,
  generateRiskMatrix: wrappers.generateRiskMatrixWrapper,
  runStaticAnalysis: wrappers.runStaticAnalysisWrapper,
  qaGenerateTests: wrappers.qaGenerateTestsWrapper,
  qaPeerReview: wrappers.qaPeerReviewWrapper,
  
  // Proposal tools
  generateProposal: wrappers.generateProposalWrapper,
  proposalPeerReview: wrappers.proposalPeerReviewWrapper,
  packageExport: wrappers.packageExportWrapper,
  
  // Delivery tools
  generateRunbook: wrappers.generateRunbookWrapper,
  generateNginxConfig: wrappers.generateNginxConfigWrapper,
  runSmoketest: wrappers.runSmoketestWrapper,
  packageHandoff: wrappers.packageHandoffWrapper,
  
  // CI tools
  ciVerify: wrappers.ciVerifyWrapper,
  
  // Document generation tools
  generateDocument: wrappers.generateDocumentWrapper,
  generateDOCX: wrappers.generateDOCXWrapper,
  generateXLSX: wrappers.generateXLSXWrapper,
  generatePPTX: wrappers.generatePPTXWrapper,
  generateCSV: wrappers.generateCSVWrapper,
  generateMarkdown: wrappers.generateMarkdownWrapper,
  generateQuickDocument: wrappers.generateQuickDocumentWrapper,
  
  // Foundry tools
  foundryOrchestrate: wrappers.foundryOrchestrateWrapper,
  foundryStatus: wrappers.foundryStatusWrapper,
  foundryHealth: wrappers.foundryHealthWrapper,
  foundryCreateRequest: wrappers.foundryCreateRequestWrapper,
  
  // Gateway tools
  cto_sweep: wrappers.ctoSweepWrapper,
  
  // Cowork tools
  coworkList: wrappers.coworkListWrapper,
  coworkRun: wrappers.coworkRunWrapper,
  coworkSpawn: wrappers.coworkSpawnWrapper,
  coworkHealth: wrappers.coworkHealthWrapper,
  coworkPlugins: wrappers.coworkPluginsWrapper,
  coworkAgents: wrappers.coworkAgentsWrapper,
  
  // New tools
  pdf_generate: wrappers.pdfGenerateWrapper,
  summarization_summarize: wrappers.summarizationSummarizeWrapper,
  security_scan: wrappers.securityScanWrapper,
  security_redact: wrappers.securityRedactWrapper,
  security_seal_evidence: wrappers.securitySealEvidenceWrapper,
  opencode_tools_cli: wrappers.opencodeToolsCliWrapper
};

// Generate aliases
function generateAliases(): ToolDefinition[] {
  const aliases: ToolDefinition[] = [];
  
  // Existing MCP server names
  const existingMcpAliases = [
    { from: 'cto_sweep', to: 'cto_sweep' },
    { from: 'foundry_status', to: 'foundryStatus' },
    { from: 'foundry_health', to: 'foundryHealth' },
    { from: 'cowork_list', to: 'coworkList' },
    { from: 'cowork_run', to: 'coworkRun' },
    { from: 'cowork_spawn', to: 'coworkSpawn' }
  ];
  
  // Scripts/native-integrate.ts names
  const scriptAliases = [
    { from: 'search_with_retry', to: 'searchWithRetry' },
    { from: 'search_for_facts', to: 'searchForFacts' },
    { from: 'rate_limit', to: 'enforceRateLimit' },
    { from: 'source_normalize', to: 'normalizeSource' },
    { from: 'audit_log', to: 'logToolCall' },
    { from: 'audit_replay', to: 'replayRun' },
    { from: 'audit_check_reproducibility', to: 'checkReproducibility' },
    { from: 'research_extract_claims', to: 'researchClaimsExtract' },
    { from: 'research_analyze_citations', to: 'researchCitationsAnalyze' },
    { from: 'research_finalize', to: 'researchDossierFinalize' },
    { from: 'discovery_start_session', to: 'startSession' },
    { from: 'discovery_export_session', to: 'exportSession' },
    { from: 'docs_generate_prd', to: 'generatePRD' },
    { from: 'docs_generate_sow', to: 'generateSOW' },
    { from: 'arch_generate', to: 'generateArchitecture' },
    { from: 'backlog_generate', to: 'generateBacklog' },
    { from: 'codegen_scaffold', to: 'scaffold' },
    { from: 'codegen_feature', to: 'generateFeature' },
    { from: 'codegen_tests', to: 'codegenGenerateTests' },
    { from: 'qa_generate_testplan', to: 'generateTestPlan' },
    { from: 'qa_generate_risk_matrix', to: 'generateRiskMatrix' },
    { from: 'qa_static_analysis', to: 'runStaticAnalysis' },
    { from: 'qa_generate_tests', to: 'qaGenerateTests' },
    { from: 'qa_peer_review', to: 'qaPeerReview' },
    { from: 'proposal_generate', to: 'generateProposal' },
    { from: 'proposal_peer_review', to: 'proposalPeerReview' },
    { from: 'proposal_export', to: 'packageExport' },
    { from: 'delivery_generate_runbook', to: 'generateRunbook' },
    { from: 'delivery_generate_nginx', to: 'generateNginxConfig' },
    { from: 'delivery_smoketest', to: 'runSmoketest' },
    { from: 'delivery_handoff', to: 'packageHandoff' },
    { from: 'documents_docx', to: 'generateDOCX' },
    { from: 'documents_xlsx', to: 'generateXLSX' },
    { from: 'documents_pptx', to: 'generatePPTX' },
    { from: 'documents_csv', to: 'generateCSV' },
    { from: 'documents_md', to: 'generateMarkdown' },
    { from: 'ci_verify', to: 'ciVerify' }
  ];
  
  // opencode.json dotted/hyphen aliases
  const configAliases = [
    { from: 'arch.generate', to: 'generateArchitecture' },
    { from: 'backlog.generate', to: 'generateBacklog' },
    { from: 'docs.prd.generate', to: 'generatePRD' },
    { from: 'docs.sow.generate', to: 'generateSOW' },
    { from: 'codegen.scaffold', to: 'scaffold' },
    { from: 'codegen.feature', to: 'generateFeature' },
    { from: 'codegen.tests', to: 'codegenGenerateTests' },
    { from: 'qa.testplan.generate', to: 'generateTestPlan' },
    { from: 'qa.risk_matrix.generate', to: 'generateRiskMatrix' },
    { from: 'qa.static.run', to: 'runStaticAnalysis' },
    { from: 'proposal.generate', to: 'generateProposal' },
    { from: 'proposal.package.export', to: 'packageExport' },
    { from: 'delivery.runbook.generate', to: 'generateRunbook' },
    { from: 'delivery.nginx.generate', to: 'generateNginxConfig' },
    { from: 'delivery.smoketest.run', to: 'runSmoketest' },
    { from: 'delivery.handoff.package', to: 'packageHandoff' },
    { from: 'documents.docx.generate', to: 'generateDOCX' },
    { from: 'documents.xlsx.generate', to: 'generateXLSX' },
    { from: 'documents.pptx.generate', to: 'generatePPTX' },
    { from: 'documents.csv.generate', to: 'generateCSV' },
    { from: 'documents.md.generate', to: 'generateMarkdown' },
    { from: 'ci.verify', to: 'ciVerify' },
    { from: 'rate-limit', to: 'enforceRateLimit' },
    { from: 'source-normalize', to: 'normalizeSource' },
    { from: 'audit_logToolCall', to: 'logToolCall' },
    { from: 'audit_replayRun', to: 'replayRun' },
    { from: 'audit_checkReproducibility', to: 'checkReproducibility' },
    { from: 'discovery_session_export', to: 'exportSession' },
    { from: 'research_claims_extract', to: 'researchClaimsExtract' },
    { from: 'research_citations_analyze', to: 'researchCitationsAnalyze' },
    { from: 'research_dossier_finalize', to: 'researchDossierFinalize' }
  ];
  
  // Combine all aliases
  const allAliases = [...existingMcpAliases, ...scriptAliases, ...configAliases];
  
  for (const alias of allAliases) {
    const canonicalTool = CANONICAL_TOOLS.find(t => t.name === alias.to);
    if (canonicalTool) {
      aliases.push({
        name: alias.from,
        description: canonicalTool.description,
        inputSchema: canonicalTool.inputSchema
      });
    }
  }
  
  return aliases;
}

export const TOOL_ALIASES = generateAliases();
export const TOOL_DEFS: ToolDefinition[] = [...CANONICAL_TOOLS, ...TOOL_ALIASES];

// Helper function to get handler by name (including aliases)
export function getToolHandler(name: string): ((args: any) => Promise<any>) | undefined {
  // First check if it's a canonical tool
  if (TOOL_HANDLERS[name]) {
    return TOOL_HANDLERS[name];
  }
  
  // Then check if it's an alias and map to canonical
  const alias = TOOL_ALIASES.find(t => t.name === name);
  if (alias) {
    // Find the canonical tool this alias points to
    const canonicalName = CANONICAL_TOOLS.find(t => 
      t.description === alias.description && 
      t.inputSchema === alias.inputSchema
    )?.name;
    
    if (canonicalName && TOOL_HANDLERS[canonicalName]) {
      return TOOL_HANDLERS[canonicalName];
    }
  }
  
  return undefined;
}