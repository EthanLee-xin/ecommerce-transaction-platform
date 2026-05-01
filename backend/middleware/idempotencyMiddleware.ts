import { AppError } from '../utils/appError.ts';
import { ERROR_CODES, ERROR_TYPES } from '../utils/errorCodes.ts';
import { shouldBlockDuplicate } from '../utils/idempotency.ts';
import { inMemoryIdempotencyStore } from '../utils/idempotencyStore.ts';
import { createIdempotencyKey } from '../utils/idempotencyKey.ts';

const buildIdempotencyScope = (action: string, req: any) => `${action}:${req.method}:${req.originalUrl}`;

const idempotencyGuard = (action = 'order', ttlMs = 5 * 60 * 1000, store = inMemoryIdempotencyStore) => async (req: any, res: any, next: any) => {
  const fallback = buildIdempotencyScope(action, req);
  const { blocked } = await shouldBlockDuplicate(req, store, fallback, ttlMs);

  if (blocked) {
    return next(
      new AppError(
        'Duplicate request detected',
        409,
        ERROR_CODES.CONFLICT,
        ERROR_TYPES.BUSINESS
      )
    );
  }

  next();
};

export { idempotencyGuard, buildIdempotencyScope };
