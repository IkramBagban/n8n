import type {
  INodeProperties,
  INodeType,
  INodeTypeDescription,
} from "../../types";

export const httpMethodsProperty: INodeProperties = {
  displayName: "HTTP Method",
  name: "httpMethod",
  type: "options",
  options: [
    {
      name: "DELETE",
      value: "DELETE",
    },
    {
      name: "GET",
      value: "GET",
    },
    {
      name: "HEAD",
      value: "HEAD",
    },
    {
      name: "PATCH",
      value: "PATCH",
    },
    {
      name: "POST",
      value: "POST",
    },
    {
      name: "PUT",
      value: "PUT",
    },
  ],
  default: "GET",
  description: "The HTTP method to listen to",
};

export class Webhook {
  authPropertyName = "authentication";

  description: INodeTypeDescription = {
    displayName: "Webhook",
    icon: { 
      type: "file",
      value: "webhook.svg"
    },
    name: "webhook",
    group: ["trigger"],
    version: [1, 1.1, 2, 2.1],
    defaultVersion: 2.1,
    description: "Starts the workflow when a webhook is called",
    eventTriggerDescription: "Waiting for you to call the Test URL",
    activationMessage: "You can now make calls to your production webhook URL.",
    defaults: {
      name: "Webhook",
    },
    supportsCORS: true,
    properties: [
      // {
      //   displayName: "Allow Multiple HTTP Methods",
      //   name: "multipleMethods",
      //   type: "boolean",
      //   default: false,
      //   isNodeSetting: true,
      //   description:
      //     "Whether to allow the webhook to listen for multiple HTTP methods",
      // },
      {
        displayName: "HTTP Methods",
        name: "httpMethod",
        // type: "multiOptions",
        type: "options",
        options: [
          {
            name: "DELETE",
            value: "DELETE",
          },
          {
            name: "GET",
            value: "GET",
          },
          {
            name: "HEAD",
            value: "HEAD",
          },
          {
            name: "PATCH",
            value: "PATCH",
          },
          {
            name: "POST",
            value: "POST",
          },
          {
            name: "PUT",
            value: "PUT",
          },
        ],
        // default: ["GET", "POST"],
        default: "GET",
        description: "The HTTP methods to listen to",
      },
      {
        displayName: "Path",
        name: "path",
        type: "string",
        default: "",
        placeholder: "webhook",
        description:
          "The path to listen to, dynamic values could be specified by using ':', e.g. 'your-path/:dynamic-value'. If dynamic values are set 'webhookId' would be prepended to path.",
      },
    ],
  };
}
