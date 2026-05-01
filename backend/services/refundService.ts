import { setRefundStatus, setFulfillmentStatus } from './orderStatusService.ts';
import { restoreInventory } from './inventoryService.ts';
import { recordMetric } from '../utils/metrics.ts';
import { logRefundFailure, logOrderStateChange } from '../utils/logger.ts';

type RefundOrderLike = {
  _id?: string;
  isPaid?: boolean;
  paidAt?: unknown;
  paymentResult?: unknown;
  refundStatus?: string;
  fulfillmentStatus?: string;
  statusHistory?: any[];
};

const startRefund = (order: RefundOrderLike, note = 'Refund initiated') => {
  setRefundStatus(order, 'requested', note);
  return order;
};

const approveRefund = (order: RefundOrderLike, note = 'Refund approved') => {
  setRefundStatus(order, 'approved', note);
  return order;
};

const processRefund = async (order: RefundOrderLike) => {
  try {
    setRefundStatus(order, 'processing', 'Refund is being processed');
    await restoreInventory(order);
    setRefundStatus(order, 'completed', 'Refund completed and inventory restored');
    setFulfillmentStatus(order, 'cancelled', 'Order refunded and cancelled');

    order.isPaid = false;
    order.paidAt = undefined;
    order.paymentResult = undefined;

    recordMetric('refundSuccess');
    logOrderStateChange(order._id, 'refund:processing', { refundStatus: order.refundStatus, fulfillmentStatus: order.fulfillmentStatus });
    return order;
  } catch (error: unknown) {
    recordMetric('refundFailure');
    logRefundFailure({ orderId: order?._id || null, reason: error instanceof Error ? error.message : 'unknown_error' });
    throw error;
  }
};

const rejectRefund = (order: RefundOrderLike, note = 'Refund rejected') => {
  setRefundStatus(order, 'rejected', note);
  return order;
};

export { startRefund, approveRefund, processRefund, rejectRefund };
