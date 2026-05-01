import { DEFAULT_TTL_MS } from './idempotencyStore.ts';

const toHeaderString = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
};

type IdempotencyLikeRequest = {
  headers: Record<string, string | string[] | undefined>;
  user?: { _id?: string } | null;
  method: string;
  originalUrl: string;
};

const createIdempotencyKey = (req: IdempotencyLikeRequest, fallback = '') => {
  return (
    toHeaderString(req.headers['idempotency-key']) ||
    toHeaderString(req.headers['x-idempotency-key']) ||
    fallback ||
    `${req.user?._id || 'anonymous'}:${req.method}:${req.originalUrl}:${Date.now()}`
  );
};

const shouldBlockDuplicate = async (
  req: IdempotencyLikeRequest,
  store: {
    has: (key: string) => Promise<boolean> | boolean;
    set: (key: string, value?: number, ttlMs?: number) => Promise<unknown> | unknown;
  },
  fallback = '',
  ttlMs = DEFAULT_TTL_MS
) => {
  const key = createIdempotencyKey(req, fallback);
  if (await store.has(key)) {
    return { blocked: true, key };
  }

  await store.set(key, Date.now(), ttlMs);
  return { blocked: false, key };
};

export { createIdempotencyKey, shouldBlockDuplicate };
