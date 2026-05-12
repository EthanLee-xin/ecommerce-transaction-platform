"use client";

import { useEffect, useState } from "react";
import notify from "@/utils/notify";
import { FaPaypal, FaCreditCard } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";

import Message from "@/components/Message";
import Loader from "@/components/Loader";
import {
  useDeliverOrderMutation,
  useShipOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
  useCreateStripePaymentIntentMutation,
  useUpdateOrderShippingMutation,
  useRefundStripeOrderMutation,
} from "@/slices/ordersApiSlice";
import { normalizeImageSrc } from "@/utils/imageUtils";
import StripePaymentPanel from "@/components/StripePaymentPanel";

const StatusPill = ({ active, activeText, inactiveText }) => {
  return (
    <span
      className={
        active ? "ui-badge ui-badge-success" : "ui-badge ui-badge-danger"
      }
    >
      {active ? activeText : inactiveText}
    </span>
  );
};

const ORDER_STATUS_STEPS = [
  {
    key: "PENDING_INFO",
    label: "Info Needed",
    description: "Add shipping",
  },
  {
    key: "READY_FOR_PAYMENT",
    label: "Ready To Pay",
    description: "Choose payment",
  },
  {
    key: "PAYMENT_PENDING",
    label: "Payment Pending",
    description: "Processing",
  },
  {
    key: "PAID",
    label: "Paid",
    description: "Confirmed",
  },
  {
    key: "SHIPPED",
    label: "Shipped",
    description: "On the way",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    description: "Completed",
  },
];

const ORDER_STATUS_LABELS = {
  PENDING_INFO: "Waiting for shipping information",
  READY_FOR_PAYMENT: "Ready for payment",
  PAYMENT_PENDING: "Payment is being processed",
  PAID: "Paid",
  PAYMENT_FAILED: "Payment failed",
  CANCELLED: "Cancelled",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

const REFUND_STATUS_LABELS = {
  NONE: "No refund",
  REFUND_REQUESTED: "Refund requested",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
  REFUND_FAILED: "Refund failed",
};

const REFUND_STATUS_DESCRIPTIONS = {
  REFUND_REQUESTED: "A refund request has been created for this order.",
  REFUND_PENDING: "The refund is being processed by the payment provider.",
  REFUNDED: "The payment has been refunded successfully.",
  REFUND_FAILED:
    "The refund could not be completed. Please try again or check the payment provider.",
};

const OrderStatusTimeline = ({ status }) => {
  const currentIndex = ORDER_STATUS_STEPS.findIndex(
    (step) => step.key === status,
  );

  const isFailed = status === "PAYMENT_FAILED";
  const isCancelled = status === "CANCELLED";

  if (isFailed || isCancelled) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-600">
              Order Status
            </p>
            <h3 className="mt-1 text-xl font-bold text-rose-700">
              {ORDER_STATUS_LABELS[status]}
            </h3>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-rose-600 shadow-sm">
            Action Required
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Order Status
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">
            {ORDER_STATUS_LABELS[status] || status}
          </h3>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ORDER_STATUS_STEPS.map((step, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;

          return (
            <div
              key={step.key}
              className={
                isCurrent
                  ? "rounded-2xl border border-indigo-500 bg-indigo-50 p-3 ring-4 ring-indigo-100"
                  : isCompleted
                    ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-3"
                    : "rounded-2xl border border-slate-200 bg-slate-50 p-3"
              }
            >
              <div
                className={
                  isCurrent
                    ? "flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white"
                    : isCompleted
                      ? "flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white"
                      : "flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-500"
                }
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              <p
                className={
                  isCurrent
                    ? "mt-3 text-sm font-bold text-indigo-700"
                    : isCompleted
                      ? "mt-3 text-sm font-bold text-emerald-700"
                      : "mt-3 text-sm font-bold text-slate-500"
                }
              >
                {step.label}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RefundStatusNotice = ({ order }) => {
  if (!order.refundStatus || order.refundStatus === "NONE") {
    return null;
  }

  const isRefunded = order.refundStatus === "REFUNDED";
  const isFailed = order.refundStatus === "REFUND_FAILED";

  const wrapperClass = isRefunded
    ? "border-emerald-200 bg-emerald-50"
    : isFailed
      ? "border-rose-200 bg-rose-50"
      : "border-amber-200 bg-amber-50";

  const pillClass = isRefunded
    ? "bg-emerald-100 text-emerald-700"
    : isFailed
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";

  const titleClass = isRefunded
    ? "text-emerald-800"
    : isFailed
      ? "text-rose-800"
      : "text-amber-800";

  return (
    <div className={`mt-4 rounded-3xl border p-5 ${wrapperClass}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Refund Status
          </p>

          <h3 className={`mt-1 text-xl font-bold ${titleClass}`}>
            {REFUND_STATUS_LABELS[order.refundStatus] || order.refundStatus}
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-600">
            {REFUND_STATUS_DESCRIPTIONS[order.refundStatus]}
          </p>

          {order.refundedAt && (
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Refunded on {order.refundedAt.substring(0, 10)}
            </p>
          )}
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${pillClass}`}
        >
          {REFUND_STATUS_LABELS[order.refundStatus] || order.refundStatus}
        </span>
      </div>
    </div>
  );
};

const OrderScreen = ({ orderId }) => {
  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [selectedPayment, setSelectedPayment] = useState("paypal");
  const [stripeClientSecret, setStripeClientSecret] = useState("");

  const [shipOrder, { isLoading: loadingShip }] = useShipOrderMutation();

  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();

  const [updateOrderShipping, { isLoading: loadingUpdateShipping }] =
    useUpdateOrderShippingMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const [createStripePaymentIntent, { isLoading: loadingStripeIntent }] =
    useCreateStripePaymentIntentMutation();

  const [refundStripeOrder, { isLoading: loadingRefund }] =
    useRefundStripeOrderMutation();

  const {
    data: paypal,
    isLoading: loadingPayPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();

  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal?.clientId && order) {
      if (!order.isPaid && !window.paypal) {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: "USD",
            locale: "en_US",
            "disable-funding": "card",
          },
        });

        paypalDispatch({
          type: "setLoadingStatus",
          value: "pending",
        });
      }
    }
  }, [errorPayPal, loadingPayPal, order, paypal, paypalDispatch]);

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              value: order.totalPrice,
            },
          },
        ],
      })
      .then((orderID) => orderID);
  };

  const onApprove = (data, actions) => {
    return actions.order.capture().then(async (details) => {
      try {
        await payOrder({ orderId, details }).unwrap();
        refetch();
        notify.success("Order is paid");
      } catch (err) {
        notify.error(err?.data?.message || err.error);
      }
    });
  };

  const onError = (err) => {
    notify.error(err.message);
  };

  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId).unwrap();
      refetch();
      notify.success("Order delivered");
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  const shipOrderHandler = async () => {
    try {
      await shipOrder(orderId).unwrap();
      notify.success("Order marked as shipped");
      refetch();
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  const stripeCheckoutHandler = async () => {
    try {
      const res = await createStripeCheckoutSession(orderId).unwrap();
      window.location.href = res.url;
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  const loadStripePaymentFormHandler = async () => {
    if (stripeClientSecret) {
      return;
    }

    try {
      const res = await createStripePaymentIntent(orderId).unwrap();
      setStripeClientSecret(res.clientSecret);
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  const stripePaidHandler = async (paymentIntent) => {
    try {
      await payOrder({
        orderId,
        details: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
          payer: {
            email_address: userInfo?.email,
          },
          payment_method: "stripe",
        },
      }).unwrap();

      refetch();
      notify.success("Order is paid");
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  const refundOrderHandler = async () => {
    if (!window.confirm("Refund this order? This action cannot be undone.")) {
      return;
    }

    try {
      await refundStripeOrder({
        orderId,
        reason: "requested_by_customer",
      }).unwrap();

      notify.success(
        "Order refunded",
        "The Stripe payment has been refunded successfully.",
      );

      refetch();
    } catch (err) {
      notify.error("Refund failed", err?.data?.message || err.error);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant="danger">{error?.data?.message || error.error}</Message>
    );
  }

  const shippingAddress = order.shippingAddress || {};
  const hasShippingAddress = Boolean(
    shippingAddress.address &&
    shippingAddress.city &&
    shippingAddress.postalCode &&
    shippingAddress.country,
  );

  const canEditShipping =
    !order.isPaid &&
    !["PAID", "SHIPPED", "DELIVERED", "CANCELLED"].includes(order.orderStatus);

  const canPay = ["READY_FOR_PAYMENT", "PAYMENT_FAILED"].includes(
    order.orderStatus,
  );

  const shouldShowShippingForm =
    canEditShipping && (!hasShippingAddress || isEditingShipping);

  const openShippingEditor = () => {
    setShippingForm({
      address: shippingAddress.address || "",
      city: shippingAddress.city || "",
      postalCode: shippingAddress.postalCode || "",
      country: shippingAddress.country || "",
    });

    setIsEditingShipping(true);
  };

  const saveShippingHandler = async (e) => {
    e.preventDefault();

    try {
      await updateOrderShipping({
        orderId,
        shippingAddress: shippingForm,
      }).unwrap();

      notify.success("Shipping address saved");
      setIsEditingShipping(false);
      refetch();
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  const actualPaymentMethod = order.isPaid
    ? order.paymentResult?.payment_method === "stripe"
      ? "Stripe"
      : order.paymentMethod
    : "Not selected";

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Order details
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Order Placement
          </h1>
          <p className="mt-3 text-slate-500">Placed by {order.user.name}</p>
        </div>
        <RefundStatusNotice order={order} />
      </div>
      <OrderStatusTimeline status={order.orderStatus} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="space-y-4">
          <div className="ui-card p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-slate-950">Shipping</h2>

              <StatusPill
                active={hasShippingAddress}
                activeText="Shipping Added"
                inactiveText="Shipping Required"
              />
            </div>

            {shouldShowShippingForm ? (
              <form onSubmit={saveShippingHandler} className="mt-6 space-y-4">
                <div>
                  <label className="ui-label" htmlFor="address">
                    Address
                  </label>
                  <input
                    id="address"
                    className="ui-input"
                    value={shippingForm.address}
                    onChange={(e) =>
                      setShippingForm((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="ui-label" htmlFor="city">
                      City
                    </label>
                    <input
                      id="city"
                      className="ui-input"
                      value={shippingForm.city}
                      onChange={(e) =>
                        setShippingForm((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="ui-label" htmlFor="postalCode">
                      Postal Code
                    </label>
                    <input
                      id="postalCode"
                      className="ui-input"
                      value={shippingForm.postalCode}
                      onChange={(e) =>
                        setShippingForm((prev) => ({
                          ...prev,
                          postalCode: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="ui-label" htmlFor="country">
                    Country
                  </label>
                  <input
                    id="country"
                    className="ui-input"
                    value={shippingForm.country}
                    onChange={(e) =>
                      setShippingForm((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={loadingUpdateShipping}
                    className="ui-button ui-button-primary"
                  >
                    {loadingUpdateShipping
                      ? "Saving..."
                      : "Save Shipping Address"}
                  </button>

                  {hasShippingAddress && (
                    <button
                      type="button"
                      onClick={() => setIsEditingShipping(false)}
                      className="ui-button ui-button-secondary"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-950">Name:</span>{" "}
                  {order.user.name}
                </p>

                <p>
                  <span className="font-semibold text-slate-950">Email:</span>{" "}
                  {order.user.email}
                </p>

                <p>
                  <span className="font-semibold text-slate-950">Address:</span>{" "}
                  {shippingAddress.address}, {shippingAddress.city}{" "}
                  {shippingAddress.postalCode}, {shippingAddress.country}
                </p>

                {canEditShipping && (
                  <button
                    type="button"
                    onClick={openShippingEditor}
                    className="ui-button ui-button-secondary mt-3"
                  >
                    Edit Shipping
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="ui-card p-5">
            <h2 className="text-xl font-bold text-slate-950">Order Items</h2>

            {order.orderItems.length === 0 ? (
              <div className="mt-4">
                <Message>Order is empty</Message>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {order.orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="grid gap-4 border-t border-slate-100 pt-3 sm:grid-cols-[64px_minmax(0,1fr)_160px] sm:items-center"
                  >
                    <Link
                      href={`/product/${item.product}`}
                      className="order-item-image rounded-xl bg-slate-100"
                    >
                      <Image
                        src={normalizeImageSrc(item.image)}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-contain p-2"
                      />
                    </Link>

                    <Link
                      href={`/product/${item.product}`}
                      className="font-medium text-slate-950 hover:text-indigo-600"
                    >
                      {item.name}
                    </Link>

                    <p className="text-sm font-semibold text-slate-700">
                      {item.qty} x ${item.price} = $
                      {(item.qty * item.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!order.isPaid && canPay && (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  Payment
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-950">
                  Choose payment method
                </h3>
              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayment("paypal")}
                  className={
                    selectedPayment === "paypal"
                      ? "group flex items-center gap-4 rounded-2xl border border-indigo-500 bg-indigo-50 p-4 text-left shadow-sm ring-4 ring-indigo-100"
                      : "group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:bg-slate-50"
                  }
                >
                  <span
                    className={
                      selectedPayment === "paypal"
                        ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white"
                        : "flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                    }
                  >
                    <FaPaypal className="h-6 w-6" />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-base font-bold text-slate-950">
                      PayPal
                    </span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">
                      Pay with your PayPal balance
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayment("stripe")}
                  className={
                    selectedPayment === "stripe"
                      ? "group flex items-center gap-4 rounded-2xl border border-indigo-500 bg-indigo-50 p-4 text-left shadow-sm ring-4 ring-indigo-100"
                      : "group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:bg-slate-50"
                  }
                >
                  <span
                    className={
                      selectedPayment === "stripe"
                        ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white"
                        : "flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                    }
                  >
                    <FaCreditCard className="h-6 w-6" />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-base font-bold text-slate-950">
                      Card
                    </span>
                    <span className="mt-1 block text-xs font-medium text-slate-500">
                      Credit or debit card
                    </span>
                  </span>
                </button>
              </div>

              {selectedPayment === "paypal" && (
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                  {loadingPay && <Loader />}

                  {isPending ? (
                    <Loader />
                  ) : (
                    <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                      style={{
                        layout: "vertical",
                        shape: "rect",
                        label: "paypal",
                      }}
                    />
                  )}
                </div>
              )}

              {selectedPayment === "stripe" && (
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                  {!stripeClientSecret && !loadingStripeIntent && (
                    <div className="flex min-h-[40px] items-center justify-center">
                      <button
                        type="button"
                        onClick={loadStripePaymentFormHandler}
                        className="ui-button ui-button-primary h-[40px] w-full"
                      >
                        Continue with Card
                      </button>
                    </div>
                  )}

                  {loadingStripeIntent && <Loader />}

                  {stripeClientSecret && (
                    <StripePaymentPanel
                      clientSecret={stripeClientSecret}
                      orderId={orderId}
                      onPaid={stripePaidHandler}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="ui-card p-5">
            <h2 className="text-xl font-bold text-slate-950">Order Summary</h2>

            <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Order ID</span>
                <span className="font-medium">{order._id}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Items</span>
                <span className="font-medium">${order.itemsPrice}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span className="font-medium">${order.shippingPrice}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax</span>
                <span className="font-medium">${order.taxPrice}</span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
                <span>Total</span>
                <span>${order.totalPrice}</span>
              </div>
              <div className="border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-slate-500">Payment</span>

                  <StatusPill
                    active={order.isPaid}
                    activeText={
                      order.paidAt
                        ? `Paid ${order.paidAt.substring(0, 10)}`
                        : "Paid"
                    }
                    inactiveText="Not Paid"
                  />
                </div>

                {order.isPaid && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Method</span>
                    <span className="font-semibold text-slate-950">
                      {order.paymentResult?.payment_method === "stripe"
                        ? "Card"
                        : order.paymentResult?.payment_method === "paypal"
                          ? "PayPal"
                          : order.paymentMethod}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-slate-500">Order Status</span>
                  <span className="text-right text-sm font-semibold text-slate-950">
                    {ORDER_STATUS_LABELS[order.orderStatus] ||
                      order.orderStatus}
                  </span>
                </div>

                {order.refundStatus && order.refundStatus !== "NONE" && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="text-slate-500">Refund</span>
                    <span
                      className={
                        order.refundStatus === "REFUNDED"
                          ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                          : order.refundStatus === "REFUND_FAILED"
                            ? "rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
                            : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                      }
                    >
                      {REFUND_STATUS_LABELS[order.refundStatus] ||
                        order.refundStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!order.isPaid && !canPay && (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-700">
                  Save your shipping address before payment.
                </div>
              </div>
            )}

            {loadingDeliver && <Loader />}

            {userInfo &&
              userInfo.isAdmin &&
              order.isPaid &&
              order.orderStatus === "PAID" && (
                <button
                  type="button"
                  onClick={shipOrderHandler}
                  className="ui-button ui-button-primary w-full"
                >
                  Mark As Shipped
                </button>
              )}

            {userInfo &&
              userInfo.isAdmin &&
              order.orderStatus === "SHIPPED" &&
              !order.isDelivered && (
                <button
                  type="button"
                  onClick={deliverHandler}
                  className="ui-button ui-button-primary w-full"
                >
                  Mark As Delivered
                </button>
              )}

            {userInfo?.isAdmin &&
              order.isPaid &&
              order.paymentMethod === "Stripe" &&
              order.refundStatus !== "REFUNDED" && (
                <button
                  type="button"
                  onClick={refundOrderHandler}
                  disabled={loadingRefund}
                  className="ui-button ui-button-danger w-full"
                >
                  {loadingRefund ? "Refunding..." : "Refund Stripe Payment"}
                </button>
              )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default OrderScreen;
