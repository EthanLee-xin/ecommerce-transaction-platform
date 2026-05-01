const DEFAULT_TTL_MS = 5 * 60 * 1000;

type CacheRecord = {
  value: number;
  expiresAt: number;
};

class InMemoryIdempotencyStore {
  cache: Map<string, CacheRecord>;

  constructor() {
    this.cache = new Map();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.cache.entries()) {
      if (record.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  has(key: string) {
    this.cleanup();
    return this.cache.has(key);
  }

  set(key: string, value = Date.now(), ttlMs = DEFAULT_TTL_MS) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
    return { key, expiresAt };
  }

  get(key: string) {
    this.cleanup();
    return this.cache.get(key);
  }
}

const createRedisIdempotencyStore = (redisClient: { get: (key: string) => Promise<string | null>; set: (key: string, value: string, options: { PX: number }) => Promise<unknown> }, prefix = 'idem:') => ({
  async has(key: string) {
    const value = await redisClient.get(`${prefix}${key}`);
    return value !== null;
  },
  async set(key: string, value = Date.now(), ttlMs = DEFAULT_TTL_MS) {
    await redisClient.set(`${prefix}${key}`, String(value), { PX: ttlMs });
    return { key: `${prefix}${key}`, expiresAt: Date.now() + ttlMs };
  },
  async get(key: string) {
    const value = await redisClient.get(`${prefix}${key}`);
    return value ? { value } : null;
  },
});

const inMemoryIdempotencyStore = new InMemoryIdempotencyStore();

export {
  DEFAULT_TTL_MS,
  InMemoryIdempotencyStore,
  createRedisIdempotencyStore,
  inMemoryIdempotencyStore,
};
