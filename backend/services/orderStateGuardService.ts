import { AppError } from '../utils/appError.ts';
import { ERROR_CODES, ERROR_TYPES } from '../utils/errorCodes.ts';

type OrderStateField = 'fulfillmentStatus' | 'refundStatus' | 'inventoryStatus';
type TransitionMap = Record<string, string[]>;

type GuardOrderLike = {
  [key in OrderStateField]?: string;
} & {
  isPaid?: boolean;
  isDelivered?: boolean;
  refundStatus?: string;
  fulfillmentStatus?: string;
  statusHistory?: any[];
};

const ORDER_STATE_TRANSITIONS: Record<OrderStateField, TransitionMap> = {
  fulfillmentStatus: {
    pending: ['allocated', 'cancelled'],
    allocated: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'completed', 'cancelled'],
    delivered: ['completed'],
    completed: [],
    cancelled: [],
  },
  refundStatus: {
    none: ['requested'],
    requested: ['approved', 'rejected'],
    approved: ['processing', 'rejected'],
    processing: ['completed', 'rejected'],
    completed: [],
    rejected: [],
  },
  inventoryStatus: {
    unreserved: ['reserved'],
    reserved: ['deducted', 'released'],
    deducted: ['restored'],
    released: [],
    restored: [],
  },
};

const assertTransitionAllowed = (field: OrderStateField, currentState: string, nextState: string) => {
  const allowedStates = ORDER_STATE_TRANSITIONS[field][currentState] || [];

  if (!allowedStates.includes(nextState)) {
    throw new AppError(
      `Illegal ${field} transition from ${currentState} to ${nextState}`,
      409,
      ERROR_CODES.CONFLICT,
      ERROR_TYPES.BUSINESS
    );
  }
};

const recordStateTransitionReason = (order: GuardOrderLike, field: OrderStateField, fromState: string, toState: string, reason: string, changedBy: string | null = null) => {
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status: `${field}:${toState}`,
    note: reason || `${field} changed from ${fromState} to ${toState}`,
    changedBy,
    changedAt: new Date(),
  });
};

const transitionOrderState = (order: GuardOrderLike, field: OrderStateField, nextState: string, reason = '', changedBy: string | null = null) => {
  const currentState = order[field] || '';
  assertTransitionAllowed(field, currentState, nextState);

  order[field] = nextState;
  recordStateTransitionReason(order, field, currentState, nextState, reason, changedBy);

  return order;
};

const ensureCanDeliverOrder = (order: GuardOrderLike) => {
  if (!order.isPaid) {
    throw new AppError(
      'Order must be paid before delivery',
      400,
      ERROR_CODES.VALIDATION_ERROR,
      ERROR_TYPES.BUSINESS
    );
  }

  if (order.refundStatus === 'completed' || order.fulfillmentStatus === 'cancelled') {
    throw new AppError(
      'Refunded or cancelled orders cannot be delivered',
      409,
      ERROR_CODES.CONFLICT,
      ERROR_TYPES.BUSINESS
    );
  }

  if (order.fulfillmentStatus === 'delivered' || order.isDelivered) {
    throw new AppError(
      'Order has already been delivered',
      409,
      ERROR_CODES.CONFLICT,
      ERROR_TYPES.BUSINESS
    );
  }
};

const ensureCanRefundOrder = (order: GuardOrderLike) => {
  if (!order.isPaid) {
    throw new AppError(
      'Unpaid orders cannot be refunded',
      400,
      ERROR_CODES.VALIDATION_ERROR,
      ERROR_TYPES.BUSINESS
    );
  }

  if (order.fulfillmentStatus === 'completed' || order.isDelivered) {
    throw new AppError(
      'Completed orders cannot be refunded',
      409,
      ERROR_CODES.CONFLICT,
      ERROR_TYPES.BUSINESS
    );
  }

  if (order.refundStatus === 'completed') {
    throw new AppError(
      'Order has already been refunded',
      409,
      ERROR_CODES.CONFLICT,
      ERROR_TYPES.BUSINESS
    );
  }
};

const ensureCanPayOrder = (order: GuardOrderLike) => {
  if (order.isPaid) {
    throw new AppError(
      'Order has already been paid',
      409,
      ERROR_CODES.CONFLICT,
      ERROR_TYPES.BUSINESS
    );
  }

  if (order.refundStatus === 'completed' || order.fulfillmentStatus === 'cancelled') {
    throw new AppError(
      'Cancelled or refunded orders cannot be paid again',
      409,
      ERROR_CODES.CONFLICT,
      ERROR_TYPES.BUSINESS
    );
  }
};

export {
  ORDER_STATE_TRANSITIONS,
  assertTransitionAllowed,
  transitionOrderState,
  recordStateTransitionReason,
  ensureCanDeliverOrder,
  ensureCanRefundOrder,
  ensureCanPayOrder,
};
