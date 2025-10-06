import { generateText, type CoreMessage } from "ai";
import type { INodeType, INodeTypeDescription } from "../../types";

export class Agent implements INodeType {
  description: INodeTypeDescription = {
    displayName: "AI Agent",
    name: "agent",
    icon: {
      type: "lucide",
      value: "Bot",
      color: "black",
    },
    group: ["transform"],
    version: [1, 1.1, 1.2],
    defaults: {
      name: "AI Agent",
    },
    description:
      "Generates an action plan and executes it. Can use external tools and models.",
    defaultVersion: 2.2,

    properties: [
      {
        displayName: "User Message",
        name: "prompt",
        type: "string",
        default: "",
        required: true,
        placeholder: "Enter your message or task for the AI agent...",
        description: "The message or task you want the AI agent to process",
      },
    ],
  };

  async execute({ parameters, model, tools }: any) {
    try {
      const { prompt } = parameters;

      if (!prompt.trim()) {
        return {
          success: false,
          error: "User message is required..",
        };
      }

      // Prepare tools for the model if provided
      // Tools must be an object with tool names as keys, not an array
      let toolsConfig = {};
        if (tools && tools.length > 0) {
          const toolsObject: Record<string, any> = {};
          tools.forEach((tool: any) => {
            toolsObject[tool.name] = {
              description: tool.description,
              parameters: tool.parameters,
              execute: tool.execute,
            };
          });
          toolsConfig = { tools: toolsObject };
          console.log(`Agent executing with ${Object.keys(toolsObject).length} tool(s):`, Object.keys(toolsObject));
        }

      // Initialize with messages format instead of prompt for better conversation tracking
      let response = await generateText({
        model,
        messages: [
          { role: "user", content: prompt.trim() },
        ],
        ...toolsConfig,
      });

      console.log("Initial response:", { hasText: !!response.text, toolCallsCount: response.toolCalls?.length });

      // Track all tool calls made and maintain conversation messages
      const allToolCalls: any[] = [];
      const conversationMessages: CoreMessage[] = [
        { role: "user", content: prompt.trim() },
      ];

      // If model answered directly without tools
      if (response.text) {
        console.log("Agent responded directly:", response.text);
        return {
          success: true,
          data: {
            prompt: prompt.trim(),
            timestamp: new Date().toISOString(),
            status: "processed",
            output: response.text,
            toolsUsed: 0,
            toolCalls: [],
          },
        };
      }

      // If model made tool calls, execute them and continue
      const maxRounds = 5;
      let round = 0;
      
      while (response.toolCalls && response.toolCalls.length > 0 && round < maxRounds) {
        round++;
        console.log(`\n🔧 Tool round ${round}: ${response.toolCalls.length} tool(s) to execute`);

        // Build tool results for this round
        const toolResults: any[] = [];
        
        // Execute all tool calls in this round
        for (const call of response.toolCalls) {
          const toolCall = call as any; // Type assertion to access properties
          
          const toolName = toolCall.toolName || toolCall.name;
          // Tool args can be in 'args' or 'input' property
          const toolArgs = toolCall.args || toolCall.input;
          
          console.log(`  - Executing tool '${toolName}' with args:`, toolArgs);
          
          // Find the tool in our tools object
          const toolsObject = (toolsConfig as any).tools || {};
          const tool = toolsObject[toolName];
          
          if (!tool) {
            console.error(`  ❌ Tool '${toolName}' not found in:`, Object.keys(toolsObject));
            continue;
          }

          let result;
          try {
            result = await tool.execute(toolArgs);
            console.log(`  ✓ Tool '${toolName}' result:`, result);
            
            allToolCalls.push({
              toolName: toolName,
              args: toolArgs,
              result: result,
            });
          } catch (error) {
            console.error(`  ❌ Tool '${toolName}' execution error:`, error);
            result = { error: error instanceof Error ? error.message : String(error) };
          }
          
          // Add to tool results array
          toolResults.push({
            type: "tool-result",
            toolCallId: toolCall.toolCallId,
            toolName: toolName,
            result: result,
          });
        }

        // Send tool results back to the model
        console.log(`Sending ${toolResults.length} tool results back to model...`);
        
        const assistantMessage: CoreMessage = {
          role: "assistant",
          content: response.toolCalls.map((tc: any) => ({
            type: "tool-call",
            toolCallId: tc.toolCallId,
            toolName: tc.toolName || tc.name,
            args: tc.args || tc.input,
          })) as any,
        };
        
        // Build tool message with results
        const toolMessage: CoreMessage = {
          role: "tool",
          content: toolResults.map(tr => ({
            type: "tool-result",
            toolCallId: tr.toolCallId,
            toolName: tr.toolName,
            result: tr.result,
          })) as any,
        };
        
        // Add to conversation
        conversationMessages.push(assistantMessage, toolMessage);
        
        response = await generateText({
          model,
          messages: conversationMessages,
          ...toolsConfig,
        });

        console.log(`Model response after tools:`, { hasText: !!response.text, hasMoreToolCalls: response.toolCalls?.length > 0 });

        // If we got text, we're done
        if (response.text) {
          console.log("✓ Agent final response:", response.text);
          break;
        }
      }

      const finalOutput = response.text || "Agent completed but provided no text response";

      return {
        success: true,
        data: {
          prompt: prompt.trim(),
          timestamp: new Date().toISOString(),
          status: "processed",
          output: finalOutput,
          toolsUsed: allToolCalls.length,
          toolCalls: allToolCalls,
          rounds: round,
        },
      };
    } catch (error) {
      console.error("Agent execution error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred in agent execution",
      };
    }
  }
}
