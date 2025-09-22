import { Engine } from "./engine";
import { redisClient } from "./lib/redis";

console.log("Hello via Bun!");

const main = async () => {
  const engine = new Engine();
  console.log("Execution Engine up and running!");

  while (true) {
    const job = await redisClient.brPop("execute-workflow", 0);
    const parsedJob = job ? JSON.parse(job.element) : null;
    const workflowId = parsedJob?.workflowId;
    await engine.run({
      workflowId,
      nodes: parsedJob.nodes,
      edges: parsedJob?.edges,
    });

    // console.log("parsedJob", parsedJob);
  }
};

main();
