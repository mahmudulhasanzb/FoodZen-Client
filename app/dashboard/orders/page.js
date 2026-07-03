"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import OrderList from "@/components/orders/OrderList";
import OrderForm from "@/components/orders/OrderForm";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal & form state
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [saving, setSaving] = useState(false);

  // Filter
  const [statusFilter, setStatusFilter] = useState("all");

  // Staff role
  const [staffRole, setStaffRole] = useState(null);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/staff/me`,
        { credentials: "include" }
      );
      if (res.ok) {
        const json = await res.json();
        setStaffRole(json.data.role);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const json = await apiGet(`/api/orders${query}`);
      setOrders(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  async function handleCreateOrder(data) {
    setSaving(true);
    setError("");
    try {
      const res = await apiPost("/api/orders", data);
      const orderId = res.data?._id;
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const trackingUrl = `${origin}/order/${orderId}`;

      setSuccess(
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 w-full">
          <span>Order created successfully!</span>
          <button
            className="btn btn-xs btn-secondary cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(trackingUrl);
              alert("Tracking link copied:\n" + trackingUrl);
            }}
          >
            🔗 Copy Tracking Link
          </button>
        </div>
      );
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateOrder(data) {
    if (!editingOrder) return;
    setSaving(true);
    setError("");
    try {
      await apiPatch(`/api/orders/${editingOrder._id}`, data);
      setSuccess("Order updated successfully!");
      setShowModal(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStatus(orderId, newStatus) {
    try {
      await apiPatch(`/api/orders/${orderId}`, { status: newStatus });
      setSuccess(`Order marked ${newStatus}`);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  function openCreate() {
    setEditingOrder(null);
    setShowModal(true);
  }

  function openEdit(order) {
    setEditingOrder(order);
    setShowModal(true);
  }

  const FILTERS = ["all", "pending", "preparing", "ready", "served", "closed", "cancelled"];

  const canCreate = staffRole === "admin" || staffRole === "manager" || staffRole === "server";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-sm opacity-60 mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""} listed
          </p>
        </div>
        {canCreate && (
          <button
            className="btn btn-primary cursor-pointer"
            onClick={openCreate}
          >
            + Create Order
          </button>
        )}
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

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`btn btn-sm cursor-pointer capitalize ${
              statusFilter === f ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setStatusFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Order List */}
      {!loading && (
        <OrderList
          orders={orders}
          onUpdateStatus={handleUpdateStatus}
          onEdit={openEdit}
          currentRole={staffRole}
        />
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="text-lg font-bold mb-4">
              {editingOrder ? "Edit Order" : "Create New Order"}
            </h3>
            <OrderForm
              order={editingOrder}
              loading={saving}
              onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder}
              onCancel={() => {
                setShowModal(false);
                setEditingOrder(null);
              }}
            />
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowModal(false);
              setEditingOrder(null);
            }}
          />
        </dialog>
      )}
    </div>
  );
}
