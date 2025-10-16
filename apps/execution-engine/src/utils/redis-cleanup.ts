import { redisClient } from "../lib/redis";

/**
 * Clean up old execution keys from Redis to prevent memory buildup
 * This should be run periodically (e.g., every hour)
 */
export async function cleanupOldExecutions() {
  try {
    console.log('Starting Redis cleanup...');
    
    // Get all execution keys
    const keys = await redisClient.keys('exec:*');
    
    if (keys.length === 0) {
      console.log('No execution keys to clean up');
      return;
    }
    
    let deletedCount = 0;
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    
    // Check each key and delete if older than 1 hour
    for (const key of keys) {
      try {
        // Extract timestamp from key (format: exec:executionId:timestamp)
        const parts = key.split(':');
        if (parts.length === 3 && parts[2]) {
          const timestamp = parseInt(parts[2], 10);
          
          if (!isNaN(timestamp) && now - timestamp > ONE_HOUR) {
            await redisClient.del(key);
            deletedCount++;
          }
        }
      } catch (err) {
        console.error(`Error processing key ${key}:`, err);
      }
    }
    
    console.log(`Redis cleanup completed. Deleted ${deletedCount} of ${keys.length} keys`);
    
    // Get memory info
    const info = await redisClient.info('memory');
    console.log('Redis memory usage:', info);
    
  } catch (error) {
    console.error('Error during Redis cleanup:', error);
  }
}

/**
 * Start periodic cleanup job
 */
export function startCleanupJob(intervalMs: number = 60 * 60 * 1000) {
  console.log(`Starting Redis cleanup job (interval: ${intervalMs}ms)`);
  
  // Run immediately
  cleanupOldExecutions();
  
  // Then run periodically
  setInterval(() => {
    cleanupOldExecutions();
  }, intervalMs);
}
