import { TelegramApi } from "../../../packages/nodes-base/utils/credentials/TelegramApi.credentials";
import { GmailOAuth2Api } from "../../../packages/nodes-base/utils/credentials/GmailOAuth2Api.credentials";
import { ResendApi } from "../../../packages/nodes-base/utils/credentials/ResendApi.credentials";
import { GoogleGeminiApi } from "../../../packages/nodes-base/utils/credentials/GoogleGeminiApi.credentials";
import type {
  ICredentialType,
  INodeProperties,
} from "../../../packages/nodes-base/types";

// Available credential types registry
export interface CredentialTypeInfo {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  description: string;
  category?: string;
  properties: INodeProperties[];
}

export const availableCredentialsObj: Record<string, ICredentialType> = {
  telegramApi: new TelegramApi(),
  gmailOAuth2Api: new GmailOAuth2Api(),
  resendApi: new ResendApi(),
  googleGeminiApi: new GoogleGeminiApi(),
};

export function getCredentialByType(
  credentialType: string
): ICredentialType | undefined {
  return availableCredentialsObj[credentialType];
}

export const getAllCredentials = (): ICredentialType[] => {
  const credentials = Object.keys(availableCredentialsObj).map((key) => {
    const credential = availableCredentialsObj[key];
    return {
      name: credential.name,
      displayName: credential.displayName,
      properties: credential.properties,
    };
  });
  return credentials;
};

export const availableCredentials = Object.keys(availableCredentialsObj).map(
  (key) => {
    const credential = availableCredentialsObj[key];
    return {
      name: credential.name,
      displayName: credential.displayName,
      properties: credential.properties,
    };
  }
);
