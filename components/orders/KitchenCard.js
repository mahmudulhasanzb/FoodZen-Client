"use client";

import { useState, useEffect } from "react";

export default function KitchenCard({ order, onUpdateStatus }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    function updateElapsed() {
      const created = new Date(order.createdAt);
      const diffMs = Date.now() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) {
        setElapsed("just now");
      } else {
        setElapsed(`${diffMins}m ago`);
      }
    }

    updateElapsed();
    const interval = setInterval(updateElapsed, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const statusColors = {
    pending: "border-warning bg-warning/5",
    preparing: "border-info bg-info/5",
    ready: "border-success bg-success/5",
  };

  const borderStyle = statusColors[order.status] || "border-base-300";

  return (
    <div className={`card border-2 ${borderStyle} shadow-sm`}>
      <div className="card-body p-4 gap-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="text-xl font-extrabold text-base-content">
            Table #{order.tableNumber}
          </span>
          <span className="text-xs opacity-60 font-medium">{elapsed}</span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              order.status === "pending"
                ? "bg-warning animate-pulse"
                : order.status === "preparing"
                ? "bg-info"
                : "bg-success"
            }`}
          />
          <span className="text-xs font-semibold uppercase tracking-wider opacity-85">
            {order.status}
          </span>
        </div>

        {/* Item List */}
        <div className="border-t border-b border-base-200 py-2 my-1 space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-baseline">
              <span className="font-bold text-sm text-base-content">
                {item.qty}x
              </span>
              <span className="flex-1 ml-2 text-sm truncate font-medium">
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-warning/10 text-warning-content text-xs p-2 rounded-lg border border-warning/20">
            <span className="font-bold">Note:</span> {order.notes}
          </div>
        )}

        {/* Actions */}
        <div className="card-actions justify-end mt-2">
          {order.status === "pending" && (
            <button
              className="btn btn-warning btn-sm w-full font-bold cursor-pointer"
              onClick={() => onUpdateStatus(order._id, "preparing")}
            >
              Start Cooking
            </button>
          )}
          {order.status === "preparing" && (
            <button
              className="btn btn-info btn-sm w-full font-bold cursor-pointer"
              onClick={() => onUpdateStatus(order._id, "ready")}
            >
              Mark Ready
            </button>
          )}
          {order.status === "ready" && (
            <div className="badge badge-success badge-md w-full py-3 font-semibold text-center text-success-content">
              Waiting for Server
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
