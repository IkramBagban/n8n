import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { INodeType, INodeTypeDescription } from "../../../types";
import { getCredentialsById } from "../../../utils/credentials/credentials";

export class LmChatGoogleGemini implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Google Gemini Chat Model",

    name: "lmChatGoogleGemini",
    icon: {
      type: "file",
      value: "google.svg",
    },
    group: ["transform", "model"],
    nodeType: "chat-model", // it is not addded in the type yet
    version: 1,
    description: "Chat Model Google Gemini",
    defaults: {
      name: "Google Gemini Chat Model",
    },
    outputNames: ["Model"],
    credentials: [
      {
        name: "googleGeminiApi",
        required: true,
      },
    ],

    properties: [
      {
        displayName: "Model",
        name: "modelId",
        type: "options",
        description:
          'The model which will generate the completion. <a href="https://developers.generativeai.google/api/rest/generativelanguage/models/list">Learn more</a>.',
        options: [
          {
            name: "gemini-2.5-flash",
            value: "gemini-2.5-flash",
            description:
              "Stable version of Gemini 2.5 Flash, mid-size multimodal model with 1M context, June 2025 release.",
          },
          {
            name: "gemini-2.5-pro",
            value: "gemini-2.5-pro",
            description:
              "Latest flagship Gemini 2.5 Pro model, state-of-the-art reasoning and multimodal support.",
          },
          {
            name: "gemini-2.0-flash-lite",
            value: "gemini-2.0-flash-lite",
            description:
              "Lightweight, cost-efficient Gemini 2.0 Flash Lite model for fast inference.",
          },
          {
            name: "gemini-1.5-pro",
            value: "gemini-1.5-pro",
            description:
              "Gemini 1.5 Pro with advanced reasoning and multimodal support, large context window.",
          },
          {
            name: "gemini-1.5-flash",
            value: "gemini-1.5-flash",
            description:
              "Gemini 1.5 Flash, optimized for speed and efficiency with long context.",
          },
          {
            name: "gemini-pro",
            value: "gemini-pro",
            description:
              "Earlier Gemini Pro model, reliable for text-only generation.",
          },
          {
            name: "gemini-flash",
            value: "gemini-flash",
            description:
              "Earlier Gemini Flash model, fast inference, smaller context size.",
          },
        ],
        default: "gemini-2.5-flash",
      },
    ],
  };

  async supplyData({
    parameters,
    credentialId,
  }: {
    parameters: any;
    credentialId?: string;
  }): Promise<{ success: boolean; response?: any; error?: string }> {
    try {
      const { modelId } = parameters;

      const credentials = await getCredentialsById<{ apiKey: string }>(
        credentialId!
      );

      const google = createGoogleGenerativeAI({
        apiKey: credentials?.apiKey,
      });

      const model = google(modelId || "gemini-2.5-flash");

      return {
        success: true,
        response: model,
      };
    } catch (error) {
      console.error("Gemini model supply error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred in model supply",
      };
    }
  }

  // Fallback execute method in case model node gets executed directly
  async execute(parameters: any, credentialId?: string) {
    console.warn(
      "Model node executed directly - models should be connected to agent's sub-component handles"
    );

    return {
      success: true,
      data: {
        message:
          "Model node should be connected to agent node's bottom handles, not executed directly",
        modelName: parameters.parameters?.modelName || "gemini-1.5-flash",
      },
    };
  }
}
