import prismaClient from "@repo/db";
import { executeWorkflow } from "./engine";
import { redisClient } from "./lib/redis";
import type { Edge, Node } from "@repo/execution-core";
import { startCleanupJob } from "./utils/redis-cleanup";

console.log("Hello via Bun!");

const main = async () => {
  console.log("Execution Engine up and running!");
  
  // Start Redis cleanup job (runs every hour)
  startCleanupJob(60 * 60 * 1000);

  while (true) {
    const job = await redisClient.brPop("execute-workflow", 0);
    console.log("Job", job);
    const parsedJob = job ? JSON.parse(job.element) : null;
    const workflowId = parsedJob?.workflowId;
    const executionId = parsedJob?.executionId;

    const execution = (await prismaClient.execution.findFirst({
      where: {
        id: executionId,
      },
    })) as {
      id: string;
      workflowId: string;
      data: {
        nodes: Node[];
        edges: Edge[];
      };
      status: string;
    } | null;

    if (!execution) {
      console.error("Execution not found");
      return;
    }

    if (!execution || !execution.data || !execution.data.nodes) {
      console.error("No nodes or edges found for execution");
      return;
    }
    const executionData = execution.data || {};

    await executeWorkflow({
      workflowId,
      executionId,
      nodes: executionData.nodes,
      edges: executionData.edges,
    });

    // console.log("parsedJob", parsedJob);
  }
};

main();
