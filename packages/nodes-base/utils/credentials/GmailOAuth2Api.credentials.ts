import type { ICredentialType, INodeProperties } from "../../types";

export class GmailOAuth2Api implements ICredentialType {
  name = "gmailOAuth2Api";
  displayName = "Gmail OAuth2 API";
  documentationUrl = "gmail";
  
  properties: INodeProperties[] = [
    {
      displayName: "Grant Type",
      name: "grantType",
      type: "hidden",
      default: "authorizationCode"
    },
    {
      displayName: "Client ID",
      name: "clientId",
      type: "string",
      default: "",
      description: "OAuth2 Client ID"
    },
    {
      displayName: "Client Secret",
      name: "clientSecret",
      type: "string",
      typeOptions: { password: true },
      default: "",
      description: "OAuth2 Client Secret"
    }
  ];
}