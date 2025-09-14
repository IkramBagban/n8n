import { ManualTrigger } from "../nodes/ManualTrigger/ManualTrigger.node";
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
};

