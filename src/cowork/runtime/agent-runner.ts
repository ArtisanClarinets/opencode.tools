import { LLMProvider, getLLMProvider, LLMMessage, LLMResponse } from './llm-provider';
import { ToolRouter } from './tool-router';
import { logger } from '../../runtime/logger';

/**
 * Agent Execution Result
 */
export interface AgentExecutionResult {
  success: boolean;
  output: string;
  transcript: any[];
}

/**
 * Agent Runner
 * Executes an agent loop:
 * 1. Model proposes next step (tool call or reasoning)
 * 2. Tool router executes allowed tool
 * 3. Transcript logs result
 * 4. Repeat until "final" result or max steps
 */
export class AgentRunner {
  private llm: LLMProvider;
  private tools: ToolRouter;
  private maxSteps: number = 10;

  constructor(tools: ToolRouter) {
    this.llm = getLLMProvider();
    this.tools = tools;
  }

  /**
   * Run an agent task
   */
  public async run(agentId: string, task: string, context?: any): Promise<AgentExecutionResult> {
    const messages: LLMMessage[] = [
      { role: 'system', content: `You are agent ${agentId}. Your goal is to complete the user task.` },
      { role: 'user', content: task }
    ];

    const transcript: any[] = [];
    let steps = 0;

    logger.info(`Starting agent run for ${agentId}`, { task });

    // Ensure tools are available for this run
    if (context?.tools) {
        this.tools.setAllowlist(agentId, context.tools);
    }

    while (steps < this.maxSteps) {
      steps++;

      try {
        // 1. Get model response
        // Note: toolDefinitions might need to be passed in specific format depending on provider
        // For now we assume provider handles it.
        const response: LLMResponse = await this.llm.chatCompletion(messages, this.tools.getDefinitions());

        // Log the thought/response
        const assistantMsg: LLMMessage = {
            role: 'assistant',
            content: response.content || ''
        };

        if (response.function_call) {
            assistantMsg.function_call = response.function_call;
            transcript.push({ type: 'tool_call', name: response.function_call.name, args: response.function_call.arguments });
        } else if (response.content) {
            transcript.push({ type: 'thought', content: response.content });
        }

        messages.push(assistantMsg);

        // 2. Check for tool call
        if (response.function_call) {
          const toolName = response.function_call.name;
          let toolArgs = {};
          try {
              toolArgs = JSON.parse(response.function_call.arguments);
          } catch (e) {
              logger.error('Failed to parse tool arguments', { toolName, args: response.function_call.arguments });
          }

          logger.info(`Agent ${agentId} calling tool ${toolName}`, toolArgs);

          // 3. Execute tool
          let toolResult;
          try {
             toolResult = await this.tools.execute(agentId, toolName, toolArgs);
             transcript.push({ type: 'tool_result', name: toolName, result: toolResult });

             messages.push({
                 role: 'function',
                 name: toolName,
                 content: JSON.stringify(toolResult)
             });
          } catch (err: any) {
             toolResult = `Error: ${err.message}`;
             transcript.push({ type: 'tool_error', name: toolName, error: err.message });

             messages.push({
                 role: 'function',
                 name: toolName,
                 content: JSON.stringify({ error: err.message })
             });
          }
        } else {
          // If no tool call, this is the final answer
          logger.info(`Agent ${agentId} finished run`);
          return {
            success: true,
            output: response.content || 'No content',
            transcript
          };
        }

      } catch (error: any) {
        logger.error(`Agent loop error: ${error.message}`);
        return {
          success: false,
          output: error.message,
          transcript
        };
      }
    }

    return {
      success: false,
      output: 'Max steps reached',
      transcript
    };
  }
}
