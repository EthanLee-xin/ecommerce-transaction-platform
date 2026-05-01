import { ERROR_CODES, ERROR_TYPES } from '../utils/errorCodes.ts';
import { buildErrorResponse } from '../utils/errorResponse.ts';
import { AppError } from '../utils/appError.ts';
import { logBusinessError, logSystemError, logUnhandledError } from '../utils/logger.ts';

const notFound = (req: any, res: any, next: any) => {
  next(
    new AppError(
      `Not Found - ${req.originalUrl}`,
      404,
      ERROR_CODES.NOT_FOUND,
      ERROR_TYPES.USER
    )
  );
};

const errorHandler = (err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const normalizedError = {
    ...buildErrorResponse(err),
    statusCode,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  };

  if (err.isOperational && err.type === ERROR_TYPES.BUSINESS) {
    logBusinessError({
      message: err.message,
      code: err.code,
      statusCode,
      path: req?.originalUrl,
      method: req?.method,
    });
  } else if (err.isOperational && err.type === ERROR_TYPES.USER) {
    logSystemError({
      message: err.message,
      code: err.code,
      statusCode,
      path: req?.originalUrl,
      method: req?.method,
    });
  } else {
    logUnhandledError({
      message: err.message,
      code: err.code || ERROR_CODES.INTERNAL_ERROR,
      statusCode,
      path: req?.originalUrl,
      method: req?.method,
      stack: err.stack,
    });
  }

  res.status(statusCode).json(normalizedError);
};

export { notFound, errorHandler };
