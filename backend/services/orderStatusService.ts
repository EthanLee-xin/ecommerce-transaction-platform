type StatusHistoryEntry = {
  status: string;
  note?: string;
  changedBy?: string | null;
  changedAt?: Date;
};

type OrderLike = {
  statusHistory?: StatusHistoryEntry[];
  inventoryStatus?: string;
  fulfillmentStatus?: string;
  refundStatus?: string;
};

const appendStatusHistory = (
  order: OrderLike,
  status: string,
  note = '',
  changedBy: string | null = null
) => {
  order.statusHistory = order.statusHistory || [];
  order.statusHistory.push({
    status,
    note,
    changedBy,
    changedAt: new Date(),
  });
};

const setInventoryStatus = (
  order: OrderLike,
  status: string,
  note = '',
  changedBy: string | null = null
) => {
  order.inventoryStatus = status;
  appendStatusHistory(order, `inventory:${status}`, note, changedBy);
};

const setFulfillmentStatus = (
  order: OrderLike,
  status: string,
  note = '',
  changedBy: string | null = null
) => {
  order.fulfillmentStatus = status;
  appendStatusHistory(order, `fulfillment:${status}`, note, changedBy);
};

const setRefundStatus = (
  order: OrderLike,
  status: string,
  note = '',
  changedBy: string | null = null
) => {
  order.refundStatus = status;
  appendStatusHistory(order, `refund:${status}`, note, changedBy);
};

export {
  appendStatusHistory,
  setInventoryStatus,
  setFulfillmentStatus,
  setRefundStatus,
};
