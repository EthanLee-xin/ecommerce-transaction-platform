import Order from '../models/orderModel.ts';

const verifyOrderPayment = async (order: any, expectedAmount: number, paymentId: string) => {
  if (!order) {
    throw new Error('Order not found');
  }

  if (Number(order.totalPrice) !== Number(expectedAmount)) {
    throw new Error('Payment amount mismatch');
  }

  if (paymentId) {
    const existingOrder = await Order.findOne({
      'paymentResult.id': paymentId,
      _id: { $ne: order._id },
    });

    if (existingOrder) {
      throw new Error('Payment transaction already used');
    }
  }
};

export { verifyOrderPayment };
