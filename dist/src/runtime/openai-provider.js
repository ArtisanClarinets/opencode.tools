"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAILLMProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class OpenAILLMProvider {
    constructor(apiKey, model = 'gpt-4') {
        this.apiKey = apiKey;
        this.model = model;
    }
    async generate(prompt, context) {
        try {
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are a helpful research assistant.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = response.data.choices[0].message.content;
            return {
                content,
                metadata: {
                    model: this.model,
                    usage: response.data.usage
                }
            };
        }
        catch (error) {
            console.error('OpenAI API Error:', error.response?.data || error.message);
            throw new Error(`OpenAI generation failed: ${error.message}`);
        }
    }
    async analyze(content, criteria) {
        const prompt = `
      Please analyze the following content based on these criteria: ${criteria}.
      Return the result as a JSON object with fields: "valid" (boolean), "score" (0-1), "comment" (string), "issues" (string array).

      Content:
      ${content.substring(0, 10000)} // Truncate to avoid token limits
    `;
        return this.generate(prompt);
    }
}
exports.OpenAILLMProvider = OpenAILLMProvider;
//# sourceMappingURL=openai-provider.js.map