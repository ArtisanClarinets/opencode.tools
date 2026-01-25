export interface LLMResponse {
  content: string;
  metadata?: any;
}

export interface LLMProvider {
  generate(prompt: string, context?: any): Promise<LLMResponse>;
  analyze(content: string, criteria: string): Promise<LLMResponse>;
}

export class MockLLMProvider implements LLMProvider {
  async generate(prompt: string, context?: any): Promise<LLMResponse> {
    // Simulate latency (skip in test)
    if (process.env.NODE_ENV !== 'test') {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (prompt.includes('summarize') || prompt.includes('summary')) {
      return {
        content: `**Executive Summary**\n\nBased on the extensive research provided, this report outlines the key findings regarding the target subject. The data suggests a strong market presence and significant opportunities for growth.\n\n**Key Findings**:\n1. Market leadership in core sectors.\n2. Innovation driven by recent R&D investments.\n3. Potential risks in supply chain stability.\n\n**Conclusion**\nThe subject demonstrates robust health with specific areas requiring attention.`
      };
    }

    return {
      content: `Generated content based on prompt: ${prompt.substring(0, 50)}...`
    };
  }

  async analyze(content: string, criteria: string): Promise<LLMResponse> {
    if (process.env.NODE_ENV !== 'test') {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (criteria.includes('citation') || criteria.includes('verify')) {
      return {
        content: JSON.stringify({
          valid: true,
          score: 0.95,
          issues: [],
          comment: "Citations appear valid and reachable."
        })
      };
    }

    if (criteria.includes('credibility') || criteria.includes('validity')) {
       return {
        content: JSON.stringify({
          valid: true,
          score: 0.88,
          issues: ["Minor inconsistency in date formatting"],
          comment: "Data sources are credible and cross-referenced."
        })
      };
    }

    return {
      content: JSON.stringify({
        valid: true,
        score: 0.9,
        comment: "Analysis passed based on provided criteria."
      })
    };
  }
}
