import type { CreateOrderDraftInput } from '../types/order.ts';

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `VIP-${timestamp}-${randomPart}`;
};

const createOrderDraft = ({
  orderItems,
  userId,
  shippingAddress,
  paymentMethod,
  prices,
  inventorySnapshot = [],
  fulfillmentChannel = 'operator',
  operatorNote = '',
}: CreateOrderDraftInput) => {
  return {
    orderNumber: generateOrderNumber(),
    orderItems,
    user: userId,
    shippingAddress,
    paymentMethod,
    paymentStatus: 'pending',
    refundReason: '',
    fulfillmentChannel,
    inventorySnapshot,
    operatorNote,
    auditTrail: [],
    itemsPrice: prices.itemsPrice,
    taxPrice: prices.taxPrice,
    shippingPrice: prices.shippingPrice,
    totalPrice: prices.totalPrice,
  };
};

export { createOrderDraft, generateOrderNumber };
