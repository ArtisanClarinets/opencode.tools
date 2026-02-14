/**
 * LLM Provider Interface for Cowork
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface LLMResponse {
  content: string | null;
  function_call?: {
    name: string;
    arguments: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMProvider {
  /**
   * Generate a completion based on messages
   */
  chatCompletion(messages: LLMMessage[], functions?: any[]): Promise<LLMResponse>;
}

/**
 * Mock LLM Provider for development/testing without keys
 */
export class MockLLMProvider implements LLMProvider {
  async chatCompletion(messages: LLMMessage[], functions?: any[]): Promise<LLMResponse> {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

    // Simple heuristic for demo purposes
    if (lastUserMessage.includes('list files')) {
      return {
        content: null,
        function_call: {
          name: 'fs.list',
          arguments: JSON.stringify({ path: '.' })
        }
      };
    }

    if (lastUserMessage.includes('read file')) {
        return {
            content: null,
            function_call: {
                name: 'fs.read',
                arguments: JSON.stringify({ path: 'README.md' })
            }
        };
    }

    return {
      content: `I am a mock LLM. I received your message: "${lastUserMessage}". I can simulate tool calls if you ask me to 'list files' or 'read file'.`
    };
  }
}

/**
 * Factory to get the appropriate provider
 */
export function getLLMProvider(): LLMProvider {
  // In a real app, check env vars for OPENAI_API_KEY, etc.
  return new MockLLMProvider();
}
