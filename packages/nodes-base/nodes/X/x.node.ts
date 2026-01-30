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
// twitter-api-v2 is imported dynamically inside execute to avoid bundling server-only
// modules (like 'fs') into client bundles.

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

export class X implements INodeType {
  description: INodeTypeDescription = {
    displayName: "X (twitter)",
    name: "x",
    icon: {
      type: "file",
      value: "x.svg",
    },
    group: ["output"],
    version: [1, 1.1, 1.2],
    // subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: "X (formerly Twitter) node to post tweets",
    defaults: {
      name: "X",
    },
    // usableAsTool: true,
    // inputs: [NodeConnectionTypes.Main],
    // outputs: [NodeConnectionTypes.Main],
    credentials: [
      //         appKey
      // appSecret
      // accessToken
      // accessSecret
      {
        name: "appKey",
        required: true,
      },
      {
        name: "appSecret",
        required: true,
      },
      {
        name: "accessToken",
        required: true,
      },
      {
        name: "accessSecret",
        required: true,
      },
    ],
    properties: [
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
    console.log("params -------> ", { parameters, credentialId });
    if (!parameters) {
      console.error("parameters are not provided");
      return { success: false, error: "parameters are not provided" };
    }

    // if (!credentialId) {
    //   console.error("credentialId is not provided");
    //   return {
    //     success: false,
    //     error: "credential is not provided",
    //   };
    // }

    // const credential = (await prismaClient.credentials.findFirst({
    //   where: { id: credentialId },
    //   select: { data: true },
    // })) as { data: { accessTokenb: string } } | null;

    // Dynamically import twitter-api-v2 at runtime (server only).
    const { TwitterApi } = await import("twitter-api-v2");

    const client = new TwitterApi({
      appKey: "KcQG3cu2fhxGU4wDl0GIjZGqX",
      appSecret: "ZlTmYXPUuEis4RH4GClDMRGaSKsLgvEpndOj8cspSEvSWBuHxf",
      accessToken: "1761276591035031552-Fm9v9akA2J5mDyZQlRSi7ylrqIE57L",
      accessSecret: "B4Me2IFERT4eJ1Br8A4kUpV28PzKbmDfu5A5dCGLRjXPd",
    });

    const tweet = await client.v2.tweet("Hello world 🌍 — posting via X API!");
    console.log(tweet);

    return { success: true, data: tweet };
  }
}
