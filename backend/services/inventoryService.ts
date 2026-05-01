import { setInventoryStatus } from './orderStatusService.ts';
import { logInventoryChange } from '../utils/logger.ts';

type InventorySnapshotItem = {
  inventoryId?: string;
  sku?: string;
  qty: number;
  price: number;
  product?: { toString?: () => string };
};

type InventoryOrderLike = {
  _id?: string;
  orderItems?: InventorySnapshotItem[];
  inventorySnapshot?: InventorySnapshotItem[];
  inventoryCommittedAt?: number;
  inventoryRestoredAt?: number;
  inventoryStatus?: string;
};

const buildInventorySnapshot = (orderItems: InventorySnapshotItem[] = []) => {
  return orderItems.map((item) => ({
    inventoryId: item.inventoryId || item.product?.toString?.() || '',
    sku: item.sku || '',
    qty: item.qty,
    price: item.price,
  }));
};

const reserveInventory = async (order: InventoryOrderLike) => {
  order.inventorySnapshot = buildInventorySnapshot(order.orderItems);
  setInventoryStatus(order, 'reserved', 'Inventory reserved for order');
  logInventoryChange({ orderId: order._id, action: 'reserve', status: order.inventoryStatus });
  return order;
};

const deductInventory = async (order: InventoryOrderLike) => {
  order.inventoryCommittedAt = Date.now();
  setInventoryStatus(order, 'deducted', 'Inventory deducted after payment');
  logInventoryChange({ orderId: order._id, action: 'deduct', status: order.inventoryStatus });
  return order;
};

const restoreInventory = async (order: InventoryOrderLike) => {
  order.inventoryRestoredAt = Date.now();
  setInventoryStatus(order, 'restored', 'Inventory restored for refund flow');
  logInventoryChange({ orderId: order._id, action: 'restore', status: order.inventoryStatus });
  return order;
};

export { reserveInventory, deductInventory, restoreInventory, buildInventorySnapshot };
