import axios from 'axios';
import { LLMProvider, LLMResponse } from './llm';

export class OpenAILLMProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(prompt: string, context?: any): Promise<LLMResponse> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a helpful research assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return {
        content,
        metadata: {
          model: this.model,
          usage: response.data.usage
        }
      };
    } catch (error: any) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error(`OpenAI generation failed: ${error.message}`);
    }
  }

  async analyze(content: string, criteria: string): Promise<LLMResponse> {
    const prompt = `
      Please analyze the following content based on these criteria: ${criteria}.
      Return the result as a JSON object with fields: "valid" (boolean), "score" (0-1), "comment" (string), "issues" (string array).

      Content:
      ${content.substring(0, 10000)} // Truncate to avoid token limits
    `;

    return this.generate(prompt);
  }
}
