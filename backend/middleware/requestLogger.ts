import { getCorrelationId, getRequestId } from '../utils/requestContext.ts';
import { logRequestStart, logRequestEnd } from '../utils/logger.ts';

const requestLogger = (req: any, res: any, next: any) => {
  const requestId = getRequestId(req);
  const correlationId = getCorrelationId(req);
  const startedAt = Date.now();

  req.requestId = requestId;
  req.correlationId = correlationId;

  res.setHeader('x-request-id', requestId);
  if (correlationId) {
    res.setHeader('x-correlation-id', correlationId);
  }

  logRequestStart(req);

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    logRequestEnd(req, res, durationMs);
  });

  next();
};

export { requestLogger };
