"use client";

import Link from "next/link";
import { FaTimes } from "react-icons/fa";

import Message from "@/components/Message";
import Loader from "@/components/Loader";
import { useGetOrdersQuery } from "@/slices/ordersApiSlice";

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Admin</p>
          <h1 className="admin-title">Orders</h1>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">ID</th>
                <th className="admin-th">User</th>
                <th className="admin-th">Date</th>
                <th className="admin-th">Total</th>
                <th className="admin-th">Paid</th>
                <th className="admin-th">Delivered</th>
                <th className="admin-th"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="admin-td font-mono text-xs">{order._id}</td>
                  <td className="admin-td">{order.user && order.user.name}</td>
                  <td className="admin-td">
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className="admin-td font-semibold">
                    ${order.totalPrice}
                  </td>
                  <td className="admin-td">
                    {order.isPaid ? (
                      <span className="ui-badge ui-badge-success">
                        {order.paidAt.substring(0, 10)}
                      </span>
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </td>
                  <td className="admin-td">
                    {order.isDelivered ? (
                      <span className="ui-badge ui-badge-success">
                        {order.deliveredAt.substring(0, 10)}
                      </span>
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </td>
                  <td className="admin-td text-right">
                    <Link
                      href={`/order/${order._id}`}
                      className="ui-button ui-button-secondary"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default OrderListScreen;
