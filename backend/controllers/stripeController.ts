import asyncHandler from '../middleware/asyncHandler.ts';
import Order from '../models/orderModel.ts';
import { AppError } from '../utils/appError.ts';
import { ERROR_CODES, ERROR_TYPES } from '../utils/errorCodes.ts';
import {
  createPaymentIntent,
  verifyStripeWebhook,
} from '../services/stripeService.ts';
import {
  logOrderStateChange,
  logStripeWebhookEvent,
  logStripeWebhookFailure,
  logPaymentFailure,
} from '../utils/logger.ts';

const getStripeConfig = asyncHandler(async (req, res) => {
  res.send({
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    defaultProvider: process.env.PAYMENT_PROVIDER_DEFAULT || 'paypal',
  });
});

const createStripePaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND, ERROR_TYPES.USER);
  }

  if (order.isPaid) {
    throw new AppError('Order is already paid', 400, ERROR_CODES.CONFLICT, ERROR_TYPES.BUSINESS);
  }

  try {
    const paymentIntent = await createPaymentIntent({
      amount: Number(order.totalPrice),
      orderId: String(order._id),
      userId: String(order.user),
    });

    order.paymentMethod = 'Stripe';
    order.paymentProvider = 'stripe';
    order.paymentStatus = 'processing';
    order.paymentIntentId = paymentIntent.id;
    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date().toISOString(),
      email_address: '',
    };
    await order.save();

    logOrderStateChange(order._id, 'stripe_intent_created', {
      requestId: req.requestId,
      correlationId: req.correlationId,
      paymentIntentId: paymentIntent.id,
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    logPaymentFailure({
      requestId: req.requestId,
      correlationId: req.correlationId,
      orderId,
      message: error.message,
      stage: 'stripe_intent_creation',
    });
    throw new AppError(
      'Stripe payment intent creation failed',
      502,
      ERROR_CODES.SERVICE_UNAVAILABLE,
      ERROR_TYPES.SYSTEM
    );
  }
});

const confirmStripePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentIntentId, paymentStatus } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404, ERROR_CODES.NOT_FOUND, ERROR_TYPES.USER);
  }

  if (order.isPaid) {
    return res.send(order);
  }

  if (order.paymentProvider !== 'stripe') {
    throw new AppError('Stripe is not the selected payment provider', 400, ERROR_CODES.CONFLICT, ERROR_TYPES.BUSINESS);
  }

  if (order.paymentIntentId && order.paymentIntentId !== paymentIntentId) {
    throw new AppError('Payment intent does not match this order', 400, ERROR_CODES.CONFLICT, ERROR_TYPES.BUSINESS);
  }

  order.isPaid = paymentStatus === 'succeeded';
  order.paidAt = order.isPaid ? new Date() : undefined;
  order.paymentStatus = order.isPaid ? 'completed' : 'failed';
  order.paymentResult = {
    id: paymentIntentId,
    status: paymentStatus,
    update_time: new Date().toISOString(),
    email_address: '',
  };
  await order.save();

  logOrderStateChange(order._id, 'stripe_payment_confirmed', {
    requestId: req.requestId,
    correlationId: req.correlationId,
    paymentIntentId,
    paymentStatus,
  });

  res.send(order);
});

const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!sig || Array.isArray(sig)) {
    logStripeWebhookFailure({
      requestId: req.requestId,
      correlationId: req.correlationId,
      message: 'Missing Stripe signature',
      eventType: 'unknown',
    });
    throw new AppError('Missing Stripe signature', 400, ERROR_CODES.VALIDATION_ERROR, ERROR_TYPES.USER);
  }

  let event;
  try {
    event = verifyStripeWebhook(req.body, sig);
  } catch (error: any) {
    logStripeWebhookFailure({
      requestId: req.requestId,
      correlationId: req.correlationId,
      message: error.message,
      eventType: 'verification_failed',
    });
    throw new AppError('Invalid Stripe webhook signature', 400, ERROR_CODES.VALIDATION_ERROR, ERROR_TYPES.USER);
  }

  const eventId = event.id;
  const eventType = event.type;

  const paymentIntent = event.data.object as any;
  const metadataOrderId = paymentIntent?.metadata?.orderId;
  const paymentIntentId = paymentIntent?.id;

  if (!paymentIntentId) {
    logStripeWebhookFailure({
      requestId: req.requestId,
      correlationId: req.correlationId,
      message: 'Stripe payment intent id is missing',
      eventId,
      eventType,
    });
    throw new AppError('Stripe payment intent id is missing', 400, ERROR_CODES.VALIDATION_ERROR, ERROR_TYPES.USER);
  }

  const order = metadataOrderId
    ? await Order.findById(metadataOrderId)
    : await Order.findOne({ paymentIntentId });

  if (!order) {
    logStripeWebhookFailure({
      requestId: req.requestId,
      correlationId: req.correlationId,
      message: 'Order not found for Stripe event',
      eventId,
      eventType,
      paymentIntentId,
    });
    throw new AppError('Order not found for Stripe event', 404, ERROR_CODES.NOT_FOUND, ERROR_TYPES.USER);
  }

  if (order.stripeEventIds?.includes(eventId)) {
    logStripeWebhookEvent({
      requestId: req.requestId,
      correlationId: req.correlationId,
      eventId,
      eventType,
      orderId: order._id,
      duplicate: true,
    });
    return res.json({ received: true, duplicate: true });
  }

  order.stripeEventIds = Array.from(new Set([...(order.stripeEventIds || []), eventId]));

  logStripeWebhookEvent({
    requestId: req.requestId,
    correlationId: req.correlationId,
    eventId,
    eventType,
    orderId: order._id,
    paymentIntentId,
  });

  if (event.type === 'payment_intent.succeeded') {
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentStatus = 'completed';
      order.paymentMethod = 'Stripe';
      order.paymentProvider = 'stripe';
      order.paymentIntentId = paymentIntentId;
      order.paymentResult = {
        id: paymentIntentId,
        status: paymentIntent.status,
        update_time: new Date().toISOString(),
        email_address: paymentIntent.receipt_email || '',
      };
      logOrderStateChange(order._id, 'stripe_webhook_paid', {
        idempotent: true,
        eventId,
        requestId: req.requestId,
        correlationId: req.correlationId,
      });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    order.paymentStatus = 'failed';
    order.paymentResult = {
      id: paymentIntentId,
      status: paymentIntent.status,
      update_time: new Date().toISOString(),
      email_address: paymentIntent.receipt_email || '',
    };
    logPaymentFailure({
      requestId: req.requestId,
      correlationId: req.correlationId,
      eventId,
      eventType,
      orderId: order._id,
      paymentIntentId,
      status: paymentIntent.status,
      source: 'stripe_webhook',
    });
  }

  await order.save();
  res.json({ received: true });
});

export {
  getStripeConfig,
  createStripePaymentIntent,
  confirmStripePayment,
  handleStripeWebhook,
};
