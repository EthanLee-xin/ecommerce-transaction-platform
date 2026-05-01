const buildErrorResponse = (err: { message?: string; code?: string; type?: string; statusCode?: number }) => ({
  success: false,
  message: err.message,
  code: err.code || 'INTERNAL_ERROR',
  type: err.type || 'SYSTEM',
  statusCode: err.statusCode || 500,
});

export { buildErrorResponse };
