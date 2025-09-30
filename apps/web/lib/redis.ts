import { createClient } from "redis";

const createRedisClient = async () => {
  const URL = process.env.REDIS_URL || "redis://localhost:6379";
  const client = createClient({
    url: URL,
  });
  await client.connect();
  return client;
};

const redisClient = await createRedisClient();

export { createRedisClient, redisClient };
