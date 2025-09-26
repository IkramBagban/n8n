import { ManualTrigger } from "../nodes/ManualTrigger/ManualTrigger.node";
import { Resend } from "../nodes/Resend/Resend.node";
import { Telegram } from "../nodes/Telegram/Telegram.node";
import { Webhook } from "../nodes/Webhook/Webhook.node";
import { Agent } from "../nodes/Agent/Agent.node";
import { LmChatGoogleGemini } from "../nodes/llms/LmChatGoogleGemini/LmChatGoogleGemini.node";

export const predefinedNodesTypes = {
  "nodes-base.manualTrigger": {
    type: new ManualTrigger(),
    sourcePath: "",
  },
  "nodes-base.webhookTrigger": {
    type: new Webhook(),
    sourcePath: "",
  },
  "nodes-base.telegram": {
    type: new Telegram(),
    sourcePath: "",
  },
  "nodes-base.resend": {
    type: new Resend(),
    sourcePath: "",
  },
  "nodes-base.agent": {
    type: new Agent(),
    sourcePath: "",
  },
  "nodes-base.lmChatGoogleGemini": {
    type: new LmChatGoogleGemini(),
    sourcePath: "",
  },
};
