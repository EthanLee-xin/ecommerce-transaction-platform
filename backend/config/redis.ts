import { createClient } from 'redis';

const createRedisClient = async () => {
  const shouldUseRedis = process.env.APP_ENV === 'staging' || process.env.APP_ENV === 'production';

  if (!shouldUseRedis || !process.env.REDIS_URL) {
    return null;
  }

  const client = createClient({ url: process.env.REDIS_URL });

  client.on('error', (error) => {
    console.error('Redis Client Error', error);
  });

  await client.connect();
  return client;
};

export { createRedisClient };
