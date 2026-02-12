"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchAgent = void 0;
const webfetch_1 = require("../../../tools/webfetch");
class ResearchAgent {
    constructor() {
        this.agentName = 'research-agent';
        this.promptVersion = 'v1';
        this.mcpVersion = 'v1';
    }
    async execute(input) {
        const runId = this.generateRunId();
        const timestamp = new Date().toISOString();
        // Gather research data
        const companyData = await this.gatherCompanyData(input);
        const industryData = await this.gatherIndustryData(input);
        const competitorData = await this.gatherCompetitorData(input);
        const techStackData = await this.gatherTechStackData(input);
        // Compile dossier
        const dossier = {
            companySummary: this.generateCompanySummary(companyData, input),
            industryOverview: this.generateIndustryOverview(industryData),
            competitors: competitorData,
            techStack: techStackData,
            risks: this.identifyRisks(input, industryData),
            opportunities: this.identifyOpportunities(input, industryData),
            recommendations: this.generateRecommendations(input, dossier)
        };
        // Compile sources
        const sources = await this.compileSources(companyData, industryData, competitorData);
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
        return `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async gatherCompanyData(input) {
        // Search for company information
        const searchQueries = [
            `${input.brief.company} company overview`,
            `${input.brief.company} about us`,
            `${input.brief.company} mission vision`
        ];
        const results = await Promise.all(searchQueries.map(query => this.searchWeb(query)));
        return results.flat();
    }
    async gatherIndustryData(input) {
        const industryQueries = [
            `${input.brief.industry} industry trends 2024`,
            `${input.brief.industry} market analysis`,
            `${input.brief.industry} technology adoption`
        ];
        const results = await Promise.all(industryQueries.map(query => this.searchWeb(query)));
        return results.flat();
    }
    async gatherCompetitorData(input) {
        const competitorQueries = [
            `${input.brief.industry} top competitors`,
            `${input.brief.company} competitors`,
            `${input.brief.industry} market leaders`
        ];
        const results = await Promise.all(competitorQueries.map(query => this.searchWeb(query)));
        return this.extractCompetitors(results.flat(), input);
    }
    async gatherTechStackData(input) {
        const techQueries = [
            `${input.brief.company} tech stack`,
            `${input.brief.company} technology`,
            `${input.brief.industry} common tech stack`
        ];
        const results = await Promise.all(techQueries.map(query => this.searchWeb(query)));
        return this.extractTechStack(results.flat());
    }
    async searchWeb(query) {
        try {
            // Use webfetch tool to search
            const result = await (0, webfetch_1.webfetch)({
                url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                format: 'text'
            });
            return [{
                    query,
                    content: result.content,
                    url: result.url,
                    timestamp: new Date().toISOString()
                }];
        }
        catch (error) {
            console.warn(`Search failed for query: ${query}`, error);
            return [];
        }
    }
    extractCompetitors(data, input) {
        // Extract competitor information from search results
        const competitors = [];
        const seen = new Set();
        for (const result of data) {
            // Simple extraction logic - in production, use more sophisticated NLP
            const lines = result.content.split('\n');
            for (const line of lines) {
                if (line.toLowerCase().includes('competitor') ||
                    line.toLowerCase().includes('competition') ||
                    line.toLowerCase().includes('alternative')) {
                    // Extract company names (simple heuristic)
                    const words = line.split(' ');
                    for (let i = 0; i < words.length - 1; i++) {
                        const potentialCompany = words[i] + ' ' + words[i + 1];
                        if (potentialCompany.length > 3 &&
                            !potentialCompany.toLowerCase().includes(input.brief.company.toLowerCase()) &&
                            !seen.has(potentialCompany)) {
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
        // Extract technologies
        for (const [category, techs] of Object.entries(commonTech)) {
            for (const tech of techs) {
                if (content.includes(tech.toLowerCase())) {
                    techStack[category].push(tech);
                }
            }
        }
        return techStack;
    }
    generateCompanySummary(companyData, input) {
        // Generate a 3-5 sentence summary
        const baseSummary = `${input.brief.company} operates in the ${input.brief.industry} industry.`;
        if (input.brief.description) {
            return `${baseSummary} ${input.brief.description}`;
        }
        // Extract key points from research
        const keyPoints = companyData.slice(0, 2).map(d => d.content.substring(0, 100));
        return `${baseSummary} Based on available information: ${keyPoints.join('. ')}`;
    }
    generateIndustryOverview(industryData) {
        // Generate industry overview from research
        const trends = industryData.slice(0, 3).map(d => d.content.substring(0, 150));
        return `The industry shows these key trends: ${trends.join('. ')}`;
    }
    identifyRisks(input, industryData) {
        const risks = [];
        // Common industry risks
        if (input.brief.constraints) {
            risks.push(...input.brief.constraints);
        }
        // Extract risks from industry data
        const riskKeywords = ['risk', 'challenge', 'threat', 'concern'];
        const content = industryData.map(d => d.content).join(' ').toLowerCase();
        for (const keyword of riskKeywords) {
            if (content.includes(keyword)) {
                risks.push(`Industry ${keyword} identified in market analysis`);
            }
        }
        return risks.slice(0, 3);
    }
    identifyOpportunities(input, industryData) {
        const opportunities = [];
        // Extract opportunities from industry data
        const oppKeywords = ['opportunity', 'growth', 'trend', 'innovation'];
        const content = industryData.map(d => d.content).join(' ').toLowerCase();
        for (const keyword of oppKeywords) {
            if (content.includes(keyword)) {
                opportunities.push(`Industry ${keyword} identified in market analysis`);
            }
        }
        // Add goal-based opportunities
        if (input.brief.goals) {
            opportunities.push(...input.brief.goals.map(g => `Opportunity to achieve: ${g}`));
        }
        return opportunities.slice(0, 3);
    }
    generateRecommendations(input, dossier) {
        const recommendations = [];
        // Based on risks and opportunities
        if (dossier.risks.length > 0) {
            recommendations.push('Address identified risks through mitigation strategies');
        }
        if (dossier.opportunities.length > 0) {
            recommendations.push('Leverage identified opportunities for competitive advantage');
        }
        // Based on tech stack
        if (dossier.techStack.frontend.length === 0) {
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
                    title: `Research: ${data.query || 'Industry Analysis'}`,
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