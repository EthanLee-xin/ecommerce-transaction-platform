import express from 'express';
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderToRefunded,
  getOrders,
} from '../controllers/orderController.ts';
import { protect } from '../middleware/authMiddleware.ts';
import { allowRoles } from '../middleware/roleMiddleware.ts';
import { createIdempotencyGuard } from '../middleware/idempotencyGuardFactory.ts';

const buildOrderRoutes = (idempotencyStore: any) => {
  const router = express.Router();
  const idempotencyGuard = createIdempotencyGuard(idempotencyStore);

  router.route('/').post(protect, idempotencyGuard('order:create'), addOrderItems).get(protect, allowRoles('operator', 'finance', 'admin'), getOrders);
  router.route('/mine').get(protect, getMyOrders);
  router.route('/:id').get(protect, getOrderById);
  router.route('/:id/pay').put(protect, idempotencyGuard('order:pay'), updateOrderToPaid);
  router.route('/:id/refund').put(protect, allowRoles('finance', 'admin'), idempotencyGuard('order:refund'), updateOrderToRefunded);
  router.route('/:id/deliver').put(protect, allowRoles('warehouse', 'operator', 'admin'), idempotencyGuard('order:deliver'), updateOrderToDelivered);

  return router;
};

export default buildOrderRoutes;
