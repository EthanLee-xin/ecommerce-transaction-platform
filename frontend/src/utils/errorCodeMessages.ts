export const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Invalid input. Please check your data and try again.',
  UNAUTHORIZED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'The current operation conflicts with the existing state. Please refresh and try again.',
  PAYMENT_REQUIRED: 'This order requires payment before it can proceed.',
  PAYMENT_NOT_VERIFIED: 'Payment verification failed. Please try again later.',
  PAYMENT_ALREADY_USED: 'This payment transaction has already been used. Do not submit it again.',
  PAYMENT_AMOUNT_MISMATCH: 'The payment amount does not match the order total.',
  INVENTORY_SNAPSHOT_MISSING: 'Inventory data is missing and the order cannot be processed.',
  ORDER_EMPTY: 'Your cart is empty and the order cannot be created.',
  INTERNAL_ERROR: 'The system is busy. Please try again later.',
};

type ErrorLike = {
  data?: { code?: string; message?: string } | unknown;
  error?: { code?: string } | string | unknown;
  code?: string;
  message?: string;
};

export const getFriendlyErrorMessage = (error: ErrorLike | null | undefined) => {
  if (!error) return ERROR_MESSAGES.INTERNAL_ERROR;

  const data = typeof error.data === 'object' && error.data !== null ? (error.data as { code?: string; message?: string }) : undefined;
  const apiError = typeof error.error === 'object' && error.error !== null ? (error.error as { code?: string }) : undefined;
  const code = data?.code || apiError?.code || error?.code;

  return ERROR_MESSAGES[code || ''] || data?.message || error?.message || ERROR_MESSAGES.INTERNAL_ERROR;
};
