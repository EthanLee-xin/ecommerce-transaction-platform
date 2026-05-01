import type { InventorySnapshotItem, OrderItem, OrderItemInput } from '../types/order.ts';

const buildOrderItemsFromSnapshot = (
  orderItems: OrderItemInput[],
  inventorySnapshot: InventorySnapshotItem[] = []
): OrderItem[] => {
  return orderItems.map((itemFromClient) => {
    const snapshot = inventorySnapshot.find(
      (item) => item._id === itemFromClient._id
    );

    if (!snapshot) {
      throw new Error('Inventory snapshot missing');
    }

    return {
      ...itemFromClient,
      product: itemFromClient._id,
      price: snapshot.price,
      sku: snapshot.sku || '',
      inventoryId: snapshot.inventoryId || snapshot._id || '',
      _id: undefined as unknown as string,
    };
  });
};

export { buildOrderItemsFromSnapshot };
