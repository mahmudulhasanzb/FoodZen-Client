"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import Link from "next/link";

export default function OrderTrackPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const json = await apiGet(`/api/orders/${id}`);
      setOrder(json.data);
      setError("");
    } catch (err) {
      if (!isSilent) setError(err.message || "Failed to load order details");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();

    // T-054: Poll status every 30 seconds
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <div className="card bg-base-100 border border-base-300 shadow-xl rounded-2xl">
          <div className="card-body p-8 space-y-6">
            <div className="text-6xl">🔍</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-error">Order Not Found</h2>
              <p className="text-sm opacity-60">
                {error || "The tracking link might be incorrect or the order no longer exists."}
              </p>
            </div>
            <div className="pt-2">
              <Link href="/" className="btn btn-primary w-full">
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map status to progress step index (0 to 3)
  const STATUS_STEPS = ["pending", "preparing", "ready", "served"];
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  const isClosed = order.status === "closed";

  const orderTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <div className="card bg-base-100 border border-base-300 shadow-xl rounded-2xl overflow-hidden">
        {/* Header banner */}
        <div className="bg-primary text-primary-content p-6 text-center space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Order Tracking</h1>
          <p className="text-xs opacity-80 font-mono">ID: {order._id}</p>
        </div>

        <div className="card-body p-6 md:p-8 space-y-6">
          {/* Table & Status Info */}
          <div className="flex justify-between items-center bg-base-200 p-4 rounded-xl">
            <div>
              <span className="text-xs opacity-50 block uppercase font-bold">Table</span>
              <span className="text-2xl font-extrabold">#{order.tableNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-xs opacity-50 block uppercase font-bold">Status</span>
              <StatusBadge status={order.status} size="md" className="mt-1" />
            </div>
          </div>

          {/* Step Progress Indicators */}
          {!isCancelled && (
            <div className="py-4">
              <ul className="steps w-full">
                <li
                  className={`step ${
                    currentStepIndex >= 0 || isClosed ? "step-primary" : ""
                  } text-xs font-semibold`}
                >
                  Ordered
                </li>
                <li
                  className={`step ${
                    currentStepIndex >= 1 || isClosed ? "step-primary" : ""
                  } text-xs font-semibold`}
                >
                  Preparing
                </li>
                <li
                  className={`step ${
                    currentStepIndex >= 2 || isClosed ? "step-primary" : ""
                  } text-xs font-semibold`}
                >
                  Ready
                </li>
                <li
                  className={`step ${
                    currentStepIndex >= 3 || isClosed ? "step-primary" : ""
                  } text-xs font-semibold`}
                >
                  Served
                </li>
              </ul>
            </div>
          )}

          {isCancelled && (
            <div className="alert alert-error text-sm rounded-xl py-3 justify-center">
              <span>⚠️ This order has been cancelled by staff.</span>
            </div>
          )}

          {/* Items Summary */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm opacity-70 uppercase tracking-wider">
              Order Details
            </h3>
            <div className="border border-base-300 rounded-xl divide-y divide-base-300">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 text-sm">
                  <span>
                    <span className="font-bold opacity-80">{item.qty}x</span> {item.name}
                  </span>
                  <span className="font-mono font-medium">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            {order.notes && (
              <div className="bg-base-200/50 border border-base-300 p-3 rounded-xl text-xs space-y-1">
                <span className="font-bold opacity-60">Customer Note:</span>
                <p className="italic opacity-85">“{order.notes}”</p>
              </div>
            )}
          </div>

          <div className="divider my-0"></div>

          {/* Order Total & Timestamp */}
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="text-xs opacity-50 block">Ordered At</span>
              <span className="text-xs font-semibold">
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs opacity-50 block">Est. Subtotal</span>
              <span className="font-mono font-bold text-xl">${orderTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xxs text-center opacity-40">
              Page polls updates automatically every 30s.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
