// import { lookup } from "mime-types";
// import type {
//   IExecuteFunctions,
//   IDataObject,
//   INodeExecutionData,
//   INodeType,
//   INodeTypeDescription,
//   IHttpRequestMethods,
//   INodeProperties,
// } from "n8n-workflow";
// import {
//   BINARY_ENCODING,
//   SEND_AND_WAIT_OPERATION,
//   NodeConnectionTypes,
//   NodeOperationError,
// } from "n8n-workflow";
import type { Readable } from "stream";
import type {
  INodeProperties,
  INodeType,
  INodeTypeDescription,
} from "../../types";
import prismaClient from "@repo/db";

// import {
//   addAdditionalFields,
//   apiRequest,
//   createSendAndWaitMessageBody,
//   getPropertyName,
// } from "./GenericFunctions";
// import { appendAttributionOption } from "../../utils/descriptions";
// import { configureWaitTillDate } from "../../utils/sendAndWait/configureWaitTillDate.util";
// import { sendAndWaitWebhooksDescription } from "../../utils/sendAndWait/descriptions";
// import {
//   getSendAndWaitProperties,
//   sendAndWaitWebhook,
// } from "../../utils/sendAndWait/utils";

// const preBuiltAgentsCallout: INodeProperties = {
//   // eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
//   displayName: "Interact with Telegram using our pre-built",
//   name: "preBuiltAgentsCalloutTelegram",
//   type: "callout",
//   default: "",
// };

export class Telegram implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Telegram",
    name: "telegram",
    icon: {
      type: "file",
      value: "telegram.svg",
    },
    group: ["output"],
    version: [1, 1.1, 1.2],
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: "Sends data to Telegram",
    defaults: {
      name: "Telegram",
    },
    // usableAsTool: true,
    // inputs: [NodeConnectionTypes.Main],
    // outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: "telegramApi",
        required: true,
      },
    ],
    // webhooks: sendAndWaitWebhooksDescription,
    properties: [
      // preBuiltAgentsCallout,
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          // {
          //   name: "Chat",
          //   value: "chat",
          // },
          // {
          //   name: "Callback",
          //   value: "callback",
          // },
          //   {
          //     name: "File",
          //     value: "file",
          //   },
          {
            name: "Message",
            value: "message",
          },
        ],
        default: "message",
      },

      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        // displayOptions: {
        //   show: {
        //     resource: ["message"],
        //   },
        // },
        options: [
          // {
          //   name: "Delete Chat Message",
          //   value: "deleteMessage",
          //   description: "Delete a chat message",
          //   action: "Delete a chat message",
          // },
          // {
          //   name: "Send Media Group",
          //   value: "sendMediaGroup",
          //   description: "Send group of photos or videos to album",
          //   action: "Send a media group message",
          // },
          {
            name: "Send Message",
            value: "sendMessage",
            description: "Send a text message",
            action: "Send a text message",
          },
        ],
        default: "sendMessage",
      },

      // ----------------------------------
      //         chat / message
      // ----------------------------------

      {
        displayName: "Chat ID",
        name: "chatId",
        type: "string",
        default: "",
        // displayOptions: {
        //   show: {
        //     operation: ["administrators", "deleteMessage", "sendMessage"],
        //     resource: ["chat", "message"],
        //   },
        // },
        required: true,
        description:
          "Unique identifier for the target chat or username, To find your chat ID ask @getinfobot",
      },
      {
        displayName: "Text",
        name: "text",
        type: "string",
        default: "",
        required: true,
      },
    ],
  };

  async execute({
    parameters,
    credentialId,
  }: any): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!parameters) {
      console.error("parameters are not provided");
      return { success: false, error: "parameters are not provided" };
    }

    if (!credentialId) {
      console.error("credentialId is not provided");
      return {
        success: false,
        error: "credential is not provided",
      };
    }

    const credential = await prismaClient.credentials.findFirst({
      where: { id: credentialId },
      select: { data: true },
    }) as { data: { accessToken: string } } | null;

    const url = `https://api.telegram.org/bot${credential?.data?.accessToken}/sendMessage?chat_id=${parameters?.chatId}&text=${parameters.text}`;
    const response = await fetch(url);
    const data = (await response.json()) as any;
    if (!data?.ok) {
      return { success: false, error: "Bad Request" };
    }
    return { success: true, data };
  }
}
