import prismaClient from "@repo/db";
import {
  type ExecutionEngine,
  type ExecutionJob,
  runWorkflowExecution,
  type Edge,
  type Node,
} from "@repo/execution-core";
import { getRedisClient } from "@/lib/redis";
import { publishExecutionEvent } from "./events";

type ExecutionPayload = {
  nodes: Node[];
  edges: Edge[];
};

const isExecutionPayload = (value: unknown): value is ExecutionPayload => {
  if (!value || typeof value !== "object") return false;
  const payload = value as { nodes?: unknown; edges?: unknown };
  return Array.isArray(payload.nodes) && Array.isArray(payload.edges);
};

const getExecutionPayload = async (executionId: string) => {
  const execution = await prismaClient.execution.findFirst({
    where: {
      id: executionId,
    },
    select: {
      data: true,
    },
  });

  if (!execution || !isExecutionPayload(execution.data)) {
    throw new Error("Execution not found or missing workflow graph data");
  }

  return execution.data;
};

export class QueueExecutionEngine implements ExecutionEngine {
  async execute(job: ExecutionJob): Promise<void> {
    const redisClient = await getRedisClient();
    await redisClient.lPush("execute-workflow", JSON.stringify(job));
  }
}

export class InMemoryExecutionEngine implements ExecutionEngine {
  async execute(job: ExecutionJob): Promise<void> {
    const executionData = await getExecutionPayload(job.executionId);

    void runWorkflowExecution(
      {
        workflowId: job.workflowId,
        executionId: job.executionId,
        nodes: executionData.nodes,
        edges: executionData.edges,
      },
      {
        publish: async (payload) => {
          await publishExecutionEvent(job.executionId, payload);
        },
      }
    ).catch((error) => {
      console.error(
        `Failed to run in-memory workflow execution ${job.executionId}:`,
        error
      );
    });
  }
}

export const isWorkerModeEnabled = () => {
  // Default is web-only mode when env is not set.
  const raw = process.env.ENABLE_WORKERS?.trim().toLowerCase();
  if (!raw) return false;
  return raw === "true" || raw === "1" || raw === "yes" || raw === "on";
};

export const getExecutionEngine = (): ExecutionEngine => {
  if (isWorkerModeEnabled()) {
    return new QueueExecutionEngine();
  }

  return new InMemoryExecutionEngine();
};
