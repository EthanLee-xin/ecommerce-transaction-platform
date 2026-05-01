import { idempotencyGuard } from './idempotencyMiddleware.ts';

const createIdempotencyGuard = (store: any) => {
  return (action: string) => idempotencyGuard(action, undefined, store);
};

export { createIdempotencyGuard };
