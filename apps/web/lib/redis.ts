import { createClient } from "redis";

type RedisClient = Awaited<ReturnType<typeof createRedisClient>>;

const createRedisClient = async () => {
  const URL = process.env.REDIS_URL || "redis://localhost:6379";
  const client = createClient({
    url: URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error("Redis: Too many reconnection attempts");
          return new Error("Too many reconnection attempts");
        }
        return Math.min(retries * 100, 3000);
      },
      connectTimeout: 10000,
    },
    disableOfflineQueue: false,
  });

  client.on("error", (err) => console.error("Redis Client Error:", err));
  client.on("connect", () => console.log("Redis Client Connected"));
  client.on("reconnecting", () => console.log("Redis Client Reconnecting"));
  client.on("ready", () => console.log("Redis Client Ready"));

  await client.connect();

  try {
    await client.configSet("maxmemory-policy", "allkeys-lru");
    console.log("Redis eviction policy set to allkeys-lru");
  } catch (err) {
    console.warn(
      "Could not set eviction policy (may need Redis Cloud config):",
      err
    );
  }

  return client;
};

let redisClient: RedisClient | null = null;
let subscriber: RedisClient | null = null;

export const getRedisClient = async () => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = await createRedisClient();
  return redisClient;
};

const getSubscriber = async () => {
  if (subscriber && subscriber.isOpen) {
    return subscriber;
  }

  const client = await getRedisClient();
  console.log("Creating new Redis Subscriber...");
  subscriber = client.duplicate();

  subscriber.on("error", (err) => {
    console.error("Redis Subscriber Error:", err);
  });

  subscriber.on("connect", () => console.log("Redis Subscriber Connected"));
  subscriber.on("reconnecting", () =>
    console.log("Redis Subscriber Reconnecting")
  );
  subscriber.on("ready", () => console.log("Redis Subscriber Ready"));

  await subscriber.connect();
  return subscriber;
};

export { createRedisClient, getSubscriber };
