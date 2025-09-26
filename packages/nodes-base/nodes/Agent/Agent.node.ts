import type { INodeType, INodeTypeDescription } from "../../types";

export class Agent implements INodeType {
  description: INodeTypeDescription = {
    displayName: "AI Agent",
    name: "agent",
    icon: "fa:robot",
    iconColor: "black",
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

    // No direct credentials - model handles its own credentials
    credentials: [],
  };

  async execute(parameters: any) {
    try {
      console.log("Executing AI Agent with parameters:", parameters);

      const { prompt } = parameters.parameters;

      console.log("Agent received prompt:", prompt);
      if (!prompt.trim()) {
        return {
          success: false,
          error: "User message is required..",
        };
      }

      // Agent processing - this will trigger connected model nodes
      const agentResult = {
        prompt: prompt.trim(),
        timestamp: new Date().toISOString(),
        status: "processed",
        message:
          "Agent received user message and will process with connected models/tools",
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
