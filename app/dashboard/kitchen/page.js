"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import KitchenCard from "@/components/orders/KitchenCard";

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchActiveOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const json = await apiGet("/api/orders");
      // filter only active kitchen orders
      const active = (json.data || []).filter((o) =>
        ["pending", "preparing", "ready"].includes(o.status)
      );
      // sort: pending first, then preparing, then ready; and then oldest first
      const sorted = active.sort((a, b) => {
        const statusOrder = { pending: 0, preparing: 1, ready: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      setOrders(sorted);
    } catch (err) {
      setError("Failed to fetch kitchen orders.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveOrders();

    // T-034: Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchActiveOrders(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchActiveOrders]);

  async function handleUpdateStatus(orderId, newStatus) {
    try {
      await apiPatch(`/api/orders/${orderId}`, { status: newStatus });
      setSuccess(`Order updated to ${newStatus}`);
      fetchActiveOrders(true);
    } catch (err) {
      setError(err.message);
    }
  }

  // Clear success msg
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kitchen Board</h1>
          <p className="text-sm opacity-60 mt-1">
            Active Orders: {orders.length} total —{" "}
            <span className="text-warning font-semibold">{pendingCount} pending</span>,{" "}
            <span className="text-info font-semibold">{preparingCount} preparing</span>,{" "}
            <span className="text-success font-semibold">{readyCount} ready</span>
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm border-base-300 cursor-pointer"
          onClick={() => fetchActiveOrders()}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
          <button
            className="btn btn-ghost btn-sm cursor-pointer"
            onClick={() => setError("")}
          >
            ✕
          </button>
        </div>
      )}
      {success && (
        <div className="alert alert-success mb-4">
          <span>{success}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-16 bg-base-100 border border-base-300 rounded-2xl shadow-sm">
          <div className="text-6xl mb-4 opacity-20">👨‍🍳</div>
          <h2 className="text-xl font-bold opacity-60">Kitchen is Clear</h2>
          <p className="opacity-40 mt-1">No pending or active orders right now.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {orders.map((order) => (
            <KitchenCard
              key={order._id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
