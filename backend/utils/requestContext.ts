const getRequestId = (req: { headers: Record<string, string | string[] | undefined> }) => {
  const requestIdHeader = req.headers['x-request-id'];
  return typeof requestIdHeader === 'string' && requestIdHeader.trim()
    ? requestIdHeader
    : `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const getCorrelationId = (req: { headers: Record<string, string | string[] | undefined> }) => {
  const correlationHeader = req.headers['x-correlation-id'];
  return typeof correlationHeader === 'string' && correlationHeader.trim()
    ? correlationHeader
    : null;
};

export { getRequestId, getCorrelationId };
