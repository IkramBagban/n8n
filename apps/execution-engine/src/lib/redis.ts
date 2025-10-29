import { createClient } from "redis";

const createRedisClient = async () => {
  const URL = process.env.REDIS_URL || "redis://localhost:6379";
  const client = createClient({
    url: URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('Redis: Too many reconnection attempts');
          return new Error('Too many reconnection attempts');
        }
        // Exponential backoff: 100ms, 200ms, 400ms, ...
        return Math.min(retries * 100, 3000);
      },
      connectTimeout: 10000,
    },
    disableOfflineQueue: false,
  });
  
  client.on('error', (err) => console.error('Redis Client Error:', err));
  client.on('connect', () => console.log('Redis Client Connected'));
  client.on('reconnecting', () => console.log('Redis Client Reconnecting'));
  client.on('ready', () => console.log('Redis Client Ready'));
  
  await client.connect();
  
  // Configure eviction policy to prevent OOM errors
  try {
    await client.configSet('maxmemory-policy', 'allkeys-lru');
    console.log('Redis eviction policy set to allkeys-lru');
  } catch (err) {
    console.warn('Could not set eviction policy (may need Redis Cloud config):', err);
  }
  
  return client;
};

const redisClient = await createRedisClient();

export { createRedisClient, redisClient };
