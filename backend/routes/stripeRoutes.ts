import express from 'express';
import {
  confirmStripePayment,
  createStripePaymentIntent,
  getStripeConfig,
  handleStripeWebhook,
} from '../controllers/stripeController.ts';
import { protect, admin } from '../middleware/authMiddleware.ts';

const router = express.Router();

router.route('/config').get(protect, getStripeConfig);
router.route('/create-payment-intent').post(protect, createStripePaymentIntent);
router.route('/confirm-payment').post(protect, confirmStripePayment);
router.route('/webhook').post(express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
