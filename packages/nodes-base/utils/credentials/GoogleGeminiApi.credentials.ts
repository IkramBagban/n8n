import type { ICredentialType, INodeProperties } from "../../types";

export class GoogleGeminiApi implements ICredentialType {
  name = "googleGeminiApi";

  displayName = "Google Gemini API";

  documentationUrl = "https://ai.google.dev/docs";

  // icon = "file:google.svg";

  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      description: "Your Google Gemini API Key. Get it from Google AI Studio.",
    },
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://generativelanguage.googleapis.com",
      description: "Base URL for Google Gemini API",
    },
  ];

  async test() {
    // #todo: here i would implement API key validation, which will check if the given key is valid or not
    return {
      status: "OK",
      message: "Connection successful",
    };
  }
}
