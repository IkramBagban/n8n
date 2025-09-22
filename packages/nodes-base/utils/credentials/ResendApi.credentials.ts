import type { ICredentialType, INodeProperties } from "../../types";

export class ResendApi implements ICredentialType {
  name = "resendApi";

  displayName = "Resend API";

  documentationUrl = "resend";

  properties: INodeProperties[] = [
    {
      displayName: "Resend Api Key",
      name: "resendApiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      description:
        "API Key for Resend. You can find it in `https://resend.com/api-keys`",
    },
  ];
}
