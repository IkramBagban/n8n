import { ManualTrigger } from "../nodes/ManualTrigger/ManualTrigger.node";
import { Resend } from "../nodes/Resend/Resend.node";
import { Telegram } from "../nodes/Telegram/Telegram.node";
import { Webhook } from "../nodes/Webhook/Webhook.node";

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
};
