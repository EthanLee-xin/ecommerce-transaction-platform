import { ERROR_CODES, ERROR_TYPES } from './errorCodes.js';

class AppError extends Error {
  statusCode: number;
  code: string;
  type: string;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, code = ERROR_CODES.INTERNAL_ERROR, type = ERROR_TYPES.SYSTEM) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.type = type;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { AppError };
