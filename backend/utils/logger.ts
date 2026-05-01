type LogPayload = Record<string, unknown>;

type LogContext = {
  requestId?: string | null;
  correlationId?: string | null;
};

const log = (level: string, event: string, payload: LogPayload = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...payload,
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));
    return;
  }

  console.log(JSON.stringify(entry));
};

const withContext = (payload: LogPayload, context?: LogContext) => ({
  ...payload,
  requestId: context?.requestId ?? null,
  correlationId: context?.correlationId ?? null,
});

const logRequestStart = (req: { method: string; originalUrl: string; headers: Record<string, string | string[] | undefined> }) =>
  log('info', 'request:start', {
    method: req.method,
    path: req.originalUrl,
    requestId: req.headers['x-request-id'] || null,
    correlationId: req.headers['x-correlation-id'] || null,
  });

const logRequestEnd = (req: { method: string; originalUrl: string; headers: Record<string, string | string[] | undefined> }, res: { statusCode: number }, durationMs: number) =>
  log('info', 'request:end', {
    method: req.method,
    path: req.originalUrl,
    statusCode: res.statusCode,
    durationMs,
    requestId: req.headers['x-request-id'] || null,
    correlationId: req.headers['x-correlation-id'] || null,
  });

const logOrderStateChange = (orderId: unknown, event: string, details: LogPayload = {}) =>
  log('info', `order:${event}`, { orderId, ...details });

const logPaymentFailure = (details: LogPayload) => log('error', 'payment:failure', details);
const logRefundFailure = (details: LogPayload) => log('error', 'refund:failure', details);
const logInventoryChange = (details: LogPayload) => log('info', 'inventory:change', details);
const logSystemError = (details: LogPayload) => log('error', 'system:error', details);
const logBusinessError = (details: LogPayload) => log('error', 'business:error', details);
const logUnhandledError = (details: LogPayload) => log('error', 'error:unhandled', details);
const logStripeWebhookEvent = (details: LogPayload) => log('info', 'stripe:webhook', details);
const logStripeWebhookFailure = (details: LogPayload) => log('error', 'stripe:webhook:failure', details);

export {
  logRequestStart,
  logRequestEnd,
  logOrderStateChange,
  logPaymentFailure,
  logRefundFailure,
  logInventoryChange,
  logSystemError,
  logBusinessError,
  logUnhandledError,
  logStripeWebhookEvent,
  logStripeWebhookFailure,
  withContext,
};
