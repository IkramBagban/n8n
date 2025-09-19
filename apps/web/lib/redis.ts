import { createClient } from "redis";

const createRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });
  await client.connect();
  return client;
};

const redisClient = await createRedisClient();

export { createRedisClient, redisClient };
