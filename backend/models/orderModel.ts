import mongoose from 'mongoose';

const orderStatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const inventorySnapshotSchema = new mongoose.Schema(
  {
    inventoryId: { type: String, default: '' },
    sku: { type: String, default: '' },
    qty: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const auditTrailSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    note: { type: String, default: '' },
    operator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        sku: { type: String, required: false, default: '' },
        inventoryId: { type: String, required: false, default: '' },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentProvider: {
      type: String,
      required: true,
      default: 'paypal',
      enum: ['paypal', 'stripe'],
    },
    paymentStatus: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    },
    paymentIntentId: {
      type: String,
      default: '',
    },
    stripeEventIds: {
      type: [String],
      default: [],
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    refundReason: {
      type: String,
      default: '',
    },
    fulfillmentChannel: {
      type: String,
      required: true,
      default: 'operator',
      enum: ['operator', 'warehouse', 'automation'],
    },
    inventorySnapshot: [inventorySnapshotSchema],
    operatorNote: {
      type: String,
      default: '',
    },
    auditTrail: [auditTrailSchema],
    fulfillmentStatus: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'allocated', 'packed', 'shipped', 'delivered', 'completed', 'cancelled'],
    },
    inventoryStatus: {
      type: String,
      required: true,
      default: 'unreserved',
      enum: ['unreserved', 'reserved', 'deducted', 'released', 'restored'],
    },
    refundStatus: {
      type: String,
      required: true,
      default: 'none',
      enum: ['none', 'requested', 'approved', 'processing', 'completed', 'rejected'],
    },
    statusHistory: [orderStatusHistorySchema],
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
