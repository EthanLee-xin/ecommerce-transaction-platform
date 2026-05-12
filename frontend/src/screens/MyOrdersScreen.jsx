"use client";

import Link from "next/link";
import Message from "@/components/Message";
import Loader from "@/components/Loader";
import { useGetMyOrdersQuery } from "@/slices/ordersApiSlice";

const ORDER_STATUS_LABELS = {
  PENDING_INFO: "Waiting for shipping information",
  READY_FOR_PAYMENT: "Ready for payment",
  PAYMENT_PENDING: "Payment processing",
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

const StatusBadge = ({ type = "default", children }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-indigo-100 text-indigo-700",
    default: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${styles[type]}`}
    >
      {children}
    </span>
  );
};

const getOrderStatusType = (status) => {
  if (["PAID", "SHIPPED", "DELIVERED"].includes(status)) return "success";
  if (["READY_FOR_PAYMENT", "PAYMENT_PENDING"].includes(status))
    return "warning";
  if (["PAYMENT_FAILED", "CANCELLED"].includes(status)) return "danger";
  return "info";
};

const getRefundStatusType = (status) => {
  if (status === "REFUNDED") return "success";
  if (status === "REFUND_FAILED") return "danger";
  if (["REFUND_REQUESTED", "REFUND_PENDING"].includes(status)) return "warning";
  return "default";
};

const MyOrdersScreen = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();
  return (
    <section>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Orders
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">My Orders</h1>
          <p className="mt-3 text-slate-500">
            Track payment, shipping, delivery, and refund status.
          </p>
        </div>

        <Link href="/profile" className="ui-button ui-button-secondary">
          Account Settings
        </Link>
      </div>

      <div className="ui-card overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-6">
            <Message variant="danger">
              {error?.data?.message || error.error}
            </Message>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-sm font-medium text-slate-500">
            You have not placed any orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Order
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Total
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Payment
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Refund
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="max-w-[180px] truncate text-sm font-bold text-slate-950">
                        {order._id}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {order.orderItems?.length || 0} item
                        {(order.orderItems?.length || 0) > 1 ? "s" : ""}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-600">
                      {order.createdAt.substring(0, 10)}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold text-slate-950">
                      ${order.totalPrice}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge type={getOrderStatusType(order.orderStatus)}>
                        {ORDER_STATUS_LABELS[order.orderStatus] ||
                          order.orderStatus}
                      </StatusBadge>
                    </td>

                    <td className="px-5 py-4">
                      {order.isPaid ? (
                        <div>
                          <StatusBadge type="success">Paid</StatusBadge>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {order.paidAt?.substring(0, 10)}
                          </p>
                        </div>
                      ) : (
                        <StatusBadge type="warning">Unpaid</StatusBadge>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {order.refundStatus && order.refundStatus !== "NONE" ? (
                        <StatusBadge
                          type={getRefundStatusType(order.refundStatus)}
                        >
                          {REFUND_STATUS_LABELS[order.refundStatus] ||
                            order.refundStatus}
                        </StatusBadge>
                      ) : (
                        <span className="text-sm font-medium text-slate-400">
                          -
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/order/${order._id}`}
                        className="ui-button ui-button-secondary inline-flex"
                      >
                        {order.isPaid ? "View" : "Continue"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyOrdersScreen;
