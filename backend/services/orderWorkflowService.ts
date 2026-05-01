import { appendStatusHistory } from './orderStatusService.ts';
import { deductInventory } from './inventoryService.ts';
import { processRefund } from './refundService.ts';
import { logOrderStateChange } from '../utils/logger.ts';
import {
  ensureCanDeliverOrder,
  ensureCanRefundOrder,
  ensureCanPayOrder,
  transitionOrderState,
} from './orderStateGuardService.ts';

const initializeOrderWorkflow = async (order: { _id?: string; fulfillmentStatus?: string }) => {
  appendStatusHistory(order, 'order:created', 'Order created');
  logOrderStateChange(order._id, 'order:created', { fulfillmentStatus: order.fulfillmentStatus });
  return order;
};

const confirmOrderPayment = async (order: { _id?: string; isPaid?: boolean; paidAt?: number | Date; paymentResult?: unknown; fulfillmentStatus?: string; inventoryStatus?: string }, paymentResult: unknown) => {
  ensureCanPayOrder(order);
  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = paymentResult;

  await deductInventory(order);
  transitionOrderState(order, 'fulfillmentStatus', 'allocated', 'Payment confirmed, order allocated');
  appendStatusHistory(order, 'payment:confirmed', 'Payment verified');
  logOrderStateChange(order._id, 'payment:confirmed', { fulfillmentStatus: order.fulfillmentStatus, inventoryStatus: order.inventoryStatus });

  return order;
};

const markOrderDelivered = async (order: { _id?: string; isDelivered?: boolean; deliveredAt?: number | Date; fulfillmentStatus?: string; refundStatus?: string; isPaid?: boolean }) => {
  ensureCanDeliverOrder(order);
  transitionOrderState(order, 'fulfillmentStatus', 'delivered', 'Order delivered');
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  logOrderStateChange(order._id, 'fulfillment:delivered', { fulfillmentStatus: order.fulfillmentStatus });
  return order;
};

const refundOrderWorkflow = async (order: { _id?: string; refundStatus?: string; fulfillmentStatus?: string; isPaid?: boolean; isDelivered?: boolean; paidAt?: unknown; paymentResult?: unknown }) => {
  ensureCanRefundOrder(order);
  await processRefund(order);
  logOrderStateChange(order._id, 'refund:completed', { refundStatus: order.refundStatus, fulfillmentStatus: order.fulfillmentStatus });
  return order;
};

export {
  initializeOrderWorkflow,
  confirmOrderPayment,
  markOrderDelivered,
  refundOrderWorkflow,
};
