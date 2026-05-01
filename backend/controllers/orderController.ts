import asyncHandler from '../middleware/asyncHandler.ts';
import Order from '../models/orderModel.ts';
import { verifyOrderPayment } from '../services/paymentService.ts';
import {
  buildOrderCreationPayload,
  createOrderRecord,
  createPaymentPayload,
} from '../controllers/orderControllerHelpers.ts';
import {
  confirmOrderPayment,
  markOrderDelivered,
  refundOrderWorkflow,
} from '../services/orderWorkflowService.ts';
import { AppError } from '../utils/appError.ts';
import { ERROR_CODES, ERROR_TYPES } from '../utils/errorCodes.ts';
import { logOrderStateChange } from '../utils/logger.ts';
import { recordMetric } from '../utils/metrics.ts';

type RequestLike = {
  body: {
    orderItems?: unknown[];
    shippingAddress?: unknown;
    paymentMethod?: string;
    inventorySnapshot?: unknown[];
    fulfillmentChannel?: 'operator' | 'warehouse' | 'automation';
    operatorNote?: string;
    id?: string;
  };
  params: { id: string };
  user: { _id: unknown };
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (payload: unknown) => void;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req: RequestLike, res: ResponseLike) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    inventorySnapshot = [],
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    throw new AppError(
      'No order items',
      400,
      ERROR_CODES.ORDER_EMPTY,
      ERROR_TYPES.USER
    );
  }

  const orderPayload = buildOrderCreationPayload({
    orderItems: orderItems || [],
    inventorySnapshot,
    userId: String(req.user._id),
    shippingAddress: shippingAddress as never,
    paymentMethod: paymentMethod || '',
    fulfillmentChannel: req.body.fulfillmentChannel || 'operator',
    operatorNote: req.body.operatorNote || '',
  });

  try {
    const createdOrder = await createOrderRecord(orderPayload);
    await createdOrder.save();
    recordMetric('orderCreateSuccess');
    logOrderStateChange(createdOrder._id, 'create', { idempotent: true });

    res.status(201).json(createdOrder);
  } catch (error) {
    recordMetric('orderCreateFailure');
    throw error;
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req: RequestLike, res: ResponseLike) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req: RequestLike, res: ResponseLike) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    throw new AppError(
      'Order not found',
      404,
      ERROR_CODES.NOT_FOUND,
      ERROR_TYPES.USER
    );
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req: RequestLike, res: ResponseLike) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await verifyOrderPayment(order as never, Number(order.totalPrice), req.body.id || '');

    await confirmOrderPayment(order as never, createPaymentPayload(req.body as any));

    const updatedOrder = await order.save();
    logOrderStateChange(updatedOrder._id, 'pay', { idempotent: true });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to refunded
// @route   PUT /api/orders/:id/refund
// @access  Private/Admin
const updateOrderToRefunded = asyncHandler(async (req: RequestLike, res: ResponseLike) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await refundOrderWorkflow(order as never);
    const updatedOrder = await order.save();
    logOrderStateChange(updatedOrder._id, 'refund', { idempotent: true });
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req: RequestLike, res: ResponseLike) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    await markOrderDelivered(order as never);
    const updatedOrder = await order.save();
    logOrderStateChange(updatedOrder._id, 'deliver', { idempotent: true });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req: RequestLike, res: ResponseLike) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  updateOrderToRefunded,
};
