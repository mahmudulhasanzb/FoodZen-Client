"use client";

import StatusBadge from "@/components/ui/StatusBadge";

export default function OrderList({ orders, onUpdateStatus, onEdit, currentRole }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 opacity-20">📝</div>
        <h2 className="text-xl font-semibold opacity-60">No orders found</h2>
        <p className="opacity-40 mt-1">Create your first order to get started.</p>
      </div>
    );
  }

  function handleCopyTrackLink(orderId) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/order/${orderId}`;
    navigator.clipboard.writeText(url);
    alert("Tracking link copied to clipboard:\n" + url);
  }

  const canEdit = currentRole === "admin" || currentRole === "manager" || currentRole === "server";

  return (
    <div className="overflow-x-auto border border-base-300 rounded-xl">
      <table className="table table-zebra w-full">
        <thead>
          <tr className="bg-base-200">
            <th>Table</th>
            <th>Items</th>
            <th>Notes</th>
            <th>Price</th>
            <th>Status</th>
            <th>Ordered At</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const orderTotal = order.items.reduce(
              (acc, item) => acc + item.price * item.qty,
              0
            );

            return (
              <tr key={order._id} className="hover align-top">
                <td className="font-bold text-center">
                  <span className="text-lg">#{order.tableNumber}</span>
                </td>
                <td>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="font-semibold">{item.qty}x</span> {item.name}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="max-w-xs truncate text-xs italic opacity-75">
                  {order.notes || "—"}
                </td>
                <td className="font-mono font-semibold">
                  ${orderTotal.toFixed(2)}
                </td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td className="text-xs opacity-70">
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>
                  <div className="flex justify-end gap-1 flex-wrap">
                    {/* Copy track link */}
                    <button
                      className="btn btn-ghost btn-xs cursor-pointer"
                      title="Copy Customer Tracking Link"
                      onClick={() => handleCopyTrackLink(order._id)}
                    >
                      🔗 Link
                    </button>

                    {/* Edit pending */}
                    {canEdit && order.status === "pending" && onEdit && (
                      <button
                        className="btn btn-ghost btn-xs text-primary cursor-pointer"
                        onClick={() => onEdit(order)}
                      >
                        Edit
                      </button>
                    )}

                    {/* Mark served (Server/Manager/Admin only, only when status is 'ready') */}
                    {canEdit && order.status === "ready" && onUpdateStatus && (
                      <button
                        className="btn btn-success btn-xs text-success-content cursor-pointer"
                        onClick={() => onUpdateStatus(order._id, "served")}
                      >
                        Serve
                      </button>
                    )}

                    {/* Cancel pending */}
                    {canEdit && order.status === "pending" && onUpdateStatus && (
                      <button
                        className="btn btn-ghost btn-xs text-error cursor-pointer"
                        onClick={() => onUpdateStatus(order._id, "cancelled")}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
