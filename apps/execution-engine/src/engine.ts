import { createRedisClient } from "./lib/redis";
import { runWorkflowExecution } from "@repo/execution-core";
import type { ExecutionRunInput } from "@repo/execution-core";

const publisher = await createRedisClient();

const publishDataToPubSub = async (payload: Record<string, unknown>) => {
  try {
    const channel = `execution-${payload.executionId}`;
    const message = JSON.stringify({ ...payload });

    await publisher.publish(channel, message);
  } catch (error) {
    console.error("Error publishing to Redis:", error);
  }
};

export const executeWorkflow = async (input: ExecutionRunInput) => {
  await runWorkflowExecution(input, {
    publish: publishDataToPubSub,
  });
};
