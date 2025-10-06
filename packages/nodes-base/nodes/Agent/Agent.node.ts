import { generateText } from "ai";
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
      // "Generates an action plan and executes it. Can use external tools and models.",
      "Generates an action plan and executes it.",
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

  async execute({ parameters, model }: any) {
    try {
      const { prompt } = parameters;

      if (!prompt.trim()) {
        return {
          success: false,
          error: "User message is required..",
        };
      }

      const response = await generateText({
        model,
        prompt: prompt.trim(),
      });

      console.log("agent response:", response);

      const agentResult = {
        prompt: prompt.trim(),
        timestamp: new Date().toISOString(),
        status: "processed",
        output: response.text,
        response: response,
      };

      return {
        success: true,
        data: agentResult,
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
