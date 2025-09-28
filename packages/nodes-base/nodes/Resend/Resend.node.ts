import type {
  INodeProperties,
  INodeType,
  INodeTypeDescription,
} from "../../types";
import prismaClient from "@repo/db";
import { ResendEmailService } from "./resend";

const resendIconUrl =
  "https://img.icons8.com/?size=100&id=nyD0PULzXd9Q&format=png&color=000000";
export class Resend implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Resend",
    name: "resend",
    icon: {
      type: "url",
      value: resendIconUrl,
      color: "green",
    },
    group: ["output"],
    version: [1, 1.1, 1.2],
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: "Send emails with Resend",
    defaults: {
      name: "Resend",
    },
    credentials: [
      {
        name: "resendApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName: "From",
        name: "from",
        type: "string",
        default: "",
        required: true,
      },
      {
        displayName: "To",
        name: "to",
        type: "string",
        default: "",
        required: true,
      },
      {
        displayName: "Subject",
        name: "subject",
        type: "string",
        default: "",
        required: true,
      },
      {
        displayName: "HTML",
        name: "html",
        type: "string",
        default: "",
        required: true,
      },
    ],
  };

  async execute({ parameters, credentialId }: any) {
    console.log("params -------> ", { parameters, credentialId });
    if (!parameters) {
      return console.error("parameters are not provided");
    }

    if (!credentialId) {
      return console.error("credentialId is not provided");
    }

    const credential = (await prismaClient.credentials.findFirst({
      where: { id: credentialId },
      select: { data: true },
    })) as { data: { resendApiKey: string } | null } | null;

    const resend = new ResendEmailService(credential?.data?.resendApiKey || "");

    const response = await resend.sendEmail({
      from: parameters.from as string,
      to: (parameters.to as string).split(","),
      subject: parameters.subject as string,
      html: parameters.html as string,
    });

    return response;
  }
}
