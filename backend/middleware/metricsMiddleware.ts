import { recordRequestDuration } from '../utils/metrics.ts';
import { logSystemError } from '../utils/logger.ts';

const metricsMiddleware = (req: any, res: any, next: any) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    recordRequestDuration(durationMs, req.originalUrl);

    if (res.statusCode >= 500) {
      logSystemError({
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      });
    }
  });

  next();
};

export { metricsMiddleware };
