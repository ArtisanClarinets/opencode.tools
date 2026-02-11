"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchAgent = exports.ResearchError = void 0;
const types_1 = require("./types");
const webfetch_1 = require("../../tools/webfetch");
const logger_1 = require("../../src/runtime/logger");
const json_db_1 = require("../../src/database/json-db");
const gatekeeper_1 = require("../../src/governance/gatekeeper");
const uuid_1 = require("uuid");
class ResearchError extends Error {
    constructor(message, context) {
        super(message);
        this.context = context;
        this.name = 'ResearchError';
    }
}
exports.ResearchError = ResearchError;
class ResearchAgent {
    constructor(db, gatekeeper) {
        this.agentName = 'research-agent';
        this.promptVersion = 'v1';
        this.mcpVersion = 'v1';
        this.db = db || new json_db_1.JsonDatabase();
        this.gatekeeper = gatekeeper || new gatekeeper_1.ResearchGatekeeper();
    }
    async execute(input) {
        const runId = this.generateRunId();
        const timestamp = new Date().toISOString();
        logger_1.logger.info('Research Agent started', { runId, company: input.brief.company });
        // Initialize Research Record in Database
        const recordId = (0, uuid_1.v4)();
        await this.db.saveResearch({
            id: recordId,
            topic: validatedInput.brief.company,
            status: 'in_progress',
            startedAt: timestamp,
            findings: []
        });
        let iterations = 0;
        const maxIterations = 3;
        let companyData = [];
        let industryData = [];
        let competitorData = [];
        let techStackData = { frontend: [], backend: [], infrastructure: [], thirdParty: [] };
        let sources = [];
        // Research Loop
        let gatePassed = false;
        while (iterations < maxIterations) {
            iterations++;
            logger_1.logger.info(`Research iteration ${iterations}/${maxIterations}`);
            // Refine queries based on iteration
            const iterationSuffix = iterations > 1 ? ` depth ${iterations}` : '';
            // Gather research data
            try {
                const [newCompanyData, newIndustryData, newCompetitorData, newTechStackData] = await Promise.all([
                    this.gatherCompanyData(validatedInput, iterationSuffix),
                    this.gatherIndustryData(validatedInput, iterationSuffix),
                    this.gatherCompetitorData(validatedInput, iterationSuffix),
                    this.gatherTechStackData(validatedInput, iterationSuffix)
                ]);
                companyData = [...companyData, ...newCompanyData];
                industryData = [...industryData, ...newIndustryData];
                // Merge competitors ensuring uniqueness by name
                const existingNames = new Set(competitorData.map(c => c.name));
                newCompetitorData.forEach(c => {
                    if (!existingNames.has(c.name)) {
                        competitorData.push(c);
                        existingNames.add(c.name);
                    }
                });
                // Merge tech stack
                this.mergeTechStack(techStackData, newTechStackData);
            }
            catch (error) {
                logger_1.logger.error('Error gathering data in iteration', { iterations, error });
                // Don't crash entirely, try to proceed with what we have
            }
            // Compile sources for gatekeeper
            sources = await this.compileSources(companyData, industryData, competitorData);
            // Check Gatekeeper
            const gateResult = this.gatekeeper.evaluate(sources);
            if (gateResult.passed) {
                logger_1.logger.info('Gatekeeper passed', { iterations, score: gateResult.score });
                gatePassed = true;
                break;
            }
            else {
                logger_1.logger.info('Gatekeeper failed, continuing research', { iterations, reasons: gateResult.reasons });
            }
        }
        // Save Findings to DB
        const currentRecord = await this.db.getResearch(recordId);
        if (currentRecord) {
            currentRecord.findings = sources.map(s => ({
                id: (0, uuid_1.v4)(),
                sourceUrl: s.url,
                content: s.title,
                timestamp: s.accessedAt,
                relevanceScore: 1
            }));
            currentRecord.status = gatePassed ? 'completed' : 'in_progress';
            if (gatePassed) {
                currentRecord.completedAt = new Date().toISOString();
            }
            await this.db.saveResearch(currentRecord);
        }
        // Generate summaries and analysis
        const companySummary = this.generateCompanySummary(companyData, validatedInput);
        const industryOverview = this.generateIndustryOverview(industryData);
        const risks = this.identifyRisks(validatedInput, industryData);
        const opportunities = this.identifyOpportunities(validatedInput, industryData);
        const recommendations = this.generateRecommendations(validatedInput, { risks, opportunities, techStack: techStackData });
        // Compile dossier
        const dossier = {
            companySummary,
            industryOverview,
            competitors: competitorData,
            techStack: techStackData,
            risks,
            opportunities,
            recommendations
        };
        logger_1.logger.info('Research Agent completed', { runId, sourcesCount: sources.length });
        return {
            dossier,
            sources,
            meta: {
                agent: this.agentName,
                promptVersion: this.promptVersion,
                mcpVersion: this.mcpVersion,
                timestamp,
                runId
            }
        };
    }
    generateRunId() {
        return `research-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    async gatherCompanyData(input, suffix = '') {
        const searchQueries = [
            `${input.brief.company} company overview${suffix}`,
            `${input.brief.company} about us${suffix}`,
            `${input.brief.company} mission vision${suffix}`
        ];
        const results = await Promise.all(searchQueries.map(query => this.searchWeb(query)));
        return results.flat();
    }
    async gatherIndustryData(input, suffix = '') {
        const industryQueries = [
            `${input.brief.industry} industry trends 2024${suffix}`,
            `${input.brief.industry} market analysis${suffix}`,
            `${input.brief.industry} technology adoption${suffix}`
        ];
        const results = await Promise.all(industryQueries.map(query => this.searchWeb(query)));
        return results.flat();
    }
    async gatherCompetitorData(input, suffix = '') {
        const competitorQueries = [
            `${input.brief.industry} top competitors${suffix}`,
            `${input.brief.company} competitors${suffix}`,
            `${input.brief.industry} market leaders${suffix}`
        ];
        const results = await Promise.all(competitorQueries.map(query => this.searchWeb(query)));
        return this.extractCompetitors(results.flat(), input);
    }
    async gatherTechStackData(input, suffix = '') {
        const techQueries = [
            `${input.brief.company} tech stack${suffix}`,
            `${input.brief.company} technology${suffix}`,
            `${input.brief.industry} common tech stack${suffix}`
        ];
        const results = await Promise.all(techQueries.map(query => this.searchWeb(query)));
        return this.extractTechStack(results.flat());
    }
    async searchWeb(query, retryCount = 0) {
        try {
            // Use webfetch tool to search via DuckDuckGo HTML (more reliable for scraping)
            // Added basic retry logic
            const result = await (0, webfetch_1.webfetch)(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, 'text');
            return [{
                    query,
                    content: result.content,
                    url: result.url,
                    timestamp: new Date().toISOString()
                }];
        }
        catch (error) {
            if (retryCount < 2) {
                logger_1.logger.warn(`Search failed for query: ${query}, retrying...`, { retryCount });
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponentialish backoff
                return this.searchWeb(query, retryCount + 1);
            }
            logger_1.logger.error(`Search failed for query: ${query} after retries`, { error, query });
            return [];
        }
    }
    extractCompetitors(data, input) {
        const competitors = [];
        const seen = new Set();
        for (const result of data) {
            const lines = result.content.split('\n');
            for (const line of lines) {
                if (line.toLowerCase().includes('competitor') ||
                    line.toLowerCase().includes('competition') ||
                    line.toLowerCase().includes('alternative')) {
                    const words = line.split(' ');
                    for (let i = 0; i < words.length - 1; i++) {
                        const potentialCompany = words[i] + ' ' + words[i + 1];
                        // Cleaner logic: check length, uniqueness, and not the client company
                        if (potentialCompany.length > 3 &&
                            !potentialCompany.toLowerCase().includes(input.brief.company.toLowerCase()) &&
                            !seen.has(potentialCompany) &&
                            /^[A-Z]/.test(potentialCompany)) { // Heuristic: Starts with Capital
                            competitors.push({
                                name: potentialCompany,
                                url: result.url,
                                differentiation: 'Market competitor',
                                marketPosition: 'Established player'
                            });
                            seen.add(potentialCompany);
                            if (competitors.length >= 5)
                                break;
                        }
                    }
                }
                if (competitors.length >= 5)
                    break;
            }
            if (competitors.length >= 5)
                break;
        }
        return competitors.slice(0, 5);
    }
    extractTechStack(data) {
        const techStack = {
            frontend: [],
            backend: [],
            infrastructure: [],
            thirdParty: []
        };
        const commonTech = {
            frontend: ['React', 'Vue', 'Angular', 'Next.js', 'Svelte'],
            backend: ['Node.js', 'Python', 'Java', 'Go', 'Ruby', 'PHP'],
            infrastructure: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'],
            thirdParty: ['Stripe', 'Twilio', 'SendGrid', 'Auth0', 'Firebase']
        };
        const content = data.map(d => d.content).join(' ').toLowerCase();
        for (const [category, techs] of Object.entries(commonTech)) {
            const cat = category;
            for (const tech of techs) {
                if (content.includes(tech.toLowerCase()) && !techStack[cat]?.includes(tech)) {
                    techStack[cat]?.push(tech);
                }
            }
        }
        return techStack;
    }
    mergeTechStack(target, source) {
        const merge = (t, s) => {
            if (!s)
                return t || [];
            if (!t)
                return s;
            return Array.from(new Set([...t, ...s]));
        };
        target.frontend = merge(target.frontend, source.frontend);
        target.backend = merge(target.backend, source.backend);
        target.infrastructure = merge(target.infrastructure, source.infrastructure);
        target.thirdParty = merge(target.thirdParty, source.thirdParty);
    }
    generateCompanySummary(companyData, input) {
        const baseSummary = `${input.brief.company} operates in the ${input.brief.industry} industry.`;
        if (input.brief.description) {
            return `${baseSummary} ${input.brief.description}`;
        }
        const keyPoints = companyData.slice(0, 2).map(d => d.content.substring(0, 100).trim());
        return `${baseSummary} Based on available information: ${keyPoints.join('. ')}`;
    }
    generateIndustryOverview(industryData) {
        const trends = industryData.slice(0, 3).map(d => d.content.substring(0, 150).trim());
        return `The industry shows these key trends: ${trends.join('. ')}`;
    }
    identifyRisks(input, industryData) {
        const risks = [];
        if (input.brief.constraints) {
            risks.push(...input.brief.constraints);
        }
        const riskKeywords = ['risk', 'challenge', 'threat', 'concern'];
        const content = industryData.map(d => d.content).join(' ').toLowerCase();
        for (const keyword of riskKeywords) {
            if (content.includes(keyword)) {
                risks.push(`Industry ${keyword} identified in market analysis`);
            }
        }
        // Deduplicate
        return Array.from(new Set(risks)).slice(0, 3);
    }
    identifyOpportunities(input, industryData) {
        const opportunities = [];
        const oppKeywords = ['opportunity', 'growth', 'trend', 'innovation'];
        const content = industryData.map(d => d.content).join(' ').toLowerCase();
        for (const keyword of oppKeywords) {
            if (content.includes(keyword)) {
                opportunities.push(`Industry ${keyword} identified in market analysis`);
            }
        }
        if (input.brief.goals) {
            opportunities.push(...input.brief.goals.map(g => `Opportunity to achieve: ${g}`));
        }
        return Array.from(new Set(opportunities)).slice(0, 3);
    }
    generateRecommendations(input, data) {
        const recommendations = [];
        if (data.risks.length > 0) {
            recommendations.push('Address identified risks through mitigation strategies');
        }
        if (data.opportunities.length > 0) {
            recommendations.push('Leverage identified opportunities for competitive advantage');
        }
        if (data.techStack.frontend && data.techStack.frontend.length === 0) {
            recommendations.push('Consider modern frontend frameworks for improved user experience');
        }
        return recommendations.slice(0, 3);
    }
    async compileSources(companyData, industryData, competitorData) {
        const allData = [...companyData, ...industryData, ...competitorData];
        const sources = [];
        const seen = new Set();
        for (const data of allData) {
            if (data.url && !seen.has(data.url)) {
                sources.push({
                    url: data.url,
                    title: data.query ? `Research: ${data.query}` : 'Competitor Analysis',
                    relevance: 'High',
                    accessedAt: data.timestamp || new Date().toISOString()
                });
                seen.add(data.url);
            }
        }
        return sources.slice(0, 10);
    }
}
exports.ResearchAgent = ResearchAgent;
//# sourceMappingURL=research-agent.js.map