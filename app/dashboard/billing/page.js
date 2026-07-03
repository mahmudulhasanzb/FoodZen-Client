"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import BillForm from "@/components/billing/BillForm";
import EmptyState from "@/components/ui/EmptyState";

export default function BillingPage() {
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal and active bill for payment
  const [activeBill, setActiveBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [creatingBill, setCreatingBill] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("served-orders");

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch served orders
      const ordersJson = await apiGet("/api/orders?status=served");
      setOrders(ordersJson.data || []);

      // Fetch bills
      const billsJson = await apiGet("/api/bills");
      setBills(billsJson.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchData();
  }, [fetchStaff, fetchData]);

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // Create bill from served order
  async function handleCreateBill(orderId) {
    setCreatingBill(true);
    setError("");
    try {
      await apiPost("/api/bills", { orderId });
      setSuccess("Bill created successfully!");
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingBill(false);
    }
  }

  // Handle bill payment submit
  async function handleProcessPayment(paymentData) {
    if (!activeBill) return;
    setSubmittingPayment(true);
    setError("");
    try {
      await apiPatch(`/api/bills/${activeBill._id}`, paymentData);
      setSuccess("Payment processed and bill closed successfully!");
      setShowPaymentModal(false);
      setActiveBill(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingPayment(false);
    }
  }

  // Filter served orders that do not have a bill created yet
  const servedWithoutBill = orders.filter(
    (order) => !bills.some((bill) => bill.orderId === order._id)
  );

  const openBills = bills.filter((b) => b.status === "open");
  const paidBills = bills.filter((b) => b.status === "paid");

  const canManageBilling =
    staffRole === "admin" || staffRole === "manager" || staffRole === "server";

  if (!canManageBilling && staffRole !== null) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⛔</div>
        <h2 className="text-2xl font-bold text-error">Access Denied</h2>
        <p className="opacity-60 mt-2">
          Your role does not have permission to view billing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing Dashboard</h1>
        <p className="text-sm opacity-60 mt-1">
          Manage restaurant checkouts, process payments, and close tables.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error shadow-lg">
          <div>
            <span className="font-semibold">Error:</span> {error}
          </div>
          <button className="btn btn-ghost btn-xs" onClick={() => setError("")}>
            ✕
          </button>
        </div>
      )}
      {success && (
        <div className="alert alert-success shadow-lg">
          <div>{success}</div>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="tabs tabs-boxed bg-base-200 p-1 rounded-xl flex gap-1">
        <button
          className={`tab flex-1 py-3 h-auto cursor-pointer font-semibold rounded-lg transition-all ${
            activeTab === "served-orders" ? "tab-active bg-primary text-primary-content" : ""
          }`}
          onClick={() => setActiveTab("served-orders")}
        >
          Served Orders
          {servedWithoutBill.length > 0 && (
            <span className="badge badge-sm badge-secondary ml-2 font-mono">
              {servedWithoutBill.length}
            </span>
          )}
        </button>
        <button
          className={`tab flex-1 py-3 h-auto cursor-pointer font-semibold rounded-lg transition-all ${
            activeTab === "open-bills" ? "tab-active bg-primary text-primary-content" : ""
          }`}
          onClick={() => setActiveTab("open-bills")}
        >
          Open Bills
          {openBills.length > 0 && (
            <span className="badge badge-sm badge-warning ml-2 font-mono">
              {openBills.length}
            </span>
          )}
        </button>
        <button
          className={`tab flex-1 py-3 h-auto cursor-pointer font-semibold rounded-lg transition-all ${
            activeTab === "paid-bills" ? "tab-active bg-primary text-primary-content" : ""
          }`}
          onClick={() => setActiveTab("paid-bills")}
        >
          Paid History
          {paidBills.length > 0 && (
            <span className="badge badge-sm badge-ghost ml-2 font-mono">
              {paidBills.length}
            </span>
          )}
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Tab Panels */}
      {!loading && (
        <div className="bg-base-100 rounded-xl">
          {/* Panel 1: Served Orders */}
          {activeTab === "served-orders" && (
            <div className="space-y-4">
              {servedWithoutBill.length === 0 ? (
                <EmptyState
                  icon="🍽️"
                  title="No Served Orders"
                  description="There are no served orders waiting to be billed."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servedWithoutBill.map((order) => {
                    const orderTotal = order.items.reduce(
                      (sum, item) => sum + item.price * item.qty,
                      0
                    );
                    return (
                      <div
                        key={order._id}
                        className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-all rounded-xl"
                      >
                        <div className="card-body p-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold">
                                Table #{order.tableNumber}
                              </h3>
                              <p className="text-xs opacity-50 font-mono">
                                Order #{order._id.substring(18)}
                              </p>
                            </div>
                            <StatusBadge status={order.status} />
                          </div>

                          {/* Items */}
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs"
                              >
                                <span className="opacity-80">
                                  {item.qty}x {item.name}
                                </span>
                                <span className="font-mono opacity-60">
                                  ${(item.price * item.qty).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="divider my-0"></div>

                          {/* Order subtotal */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold opacity-70">
                              Subtotal
                            </span>
                            <span className="font-mono font-bold text-lg">
                              ${orderTotal.toFixed(2)}
                            </span>
                          </div>

                          <div className="card-actions justify-end pt-2">
                            <button
                              className="btn btn-primary btn-sm w-full cursor-pointer"
                              disabled={creatingBill}
                              onClick={() => handleCreateBill(order._id)}
                            >
                              {creatingBill ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : (
                                "📄 Create Bill"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Panel 2: Open Bills */}
          {activeTab === "open-bills" && (
            <div className="overflow-x-auto border border-base-300 rounded-xl">
              {openBills.length === 0 ? (
                <EmptyState
                  icon="💵"
                  title="No Open Bills"
                  description="Create bills from served orders to see them here."
                />
              ) : (
                <table className="table table-zebra w-full align-middle">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Table</th>
                      <th>Subtotal</th>
                      <th>Tax</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openBills.map((bill) => (
                      <tr key={bill._id} className="hover">
                        <td className="font-bold">
                          <span className="text-lg">#{bill.order?.tableNumber}</span>
                        </td>
                        <td className="font-mono">${bill.subtotal.toFixed(2)}</td>
                        <td className="font-mono">${bill.tax.toFixed(2)}</td>
                        <td className="font-mono font-bold text-primary">
                          ${bill.total.toFixed(2)}
                        </td>
                        <td>
                          <StatusBadge status={bill.status} />
                        </td>
                        <td className="text-xs opacity-75">
                          {new Date(bill.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="text-right">
                          <button
                            className="btn btn-warning btn-sm cursor-pointer"
                            onClick={() => {
                              setActiveBill(bill);
                              setShowPaymentModal(true);
                            }}
                          >
                            💳 Pay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Panel 3: Paid Bills */}
          {activeTab === "paid-bills" && (
            <div className="overflow-x-auto border border-base-300 rounded-xl">
              {paidBills.length === 0 ? (
                <EmptyState
                  icon="✅"
                  title="No Transaction History"
                  description="Completed payments will appear here."
                />
              ) : (
                <table className="table table-zebra w-full align-middle">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Table</th>
                      <th>Subtotal</th>
                      <th>Tax</th>
                      <th>Tip</th>
                      <th>Total Paid</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Settled At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidBills.map((bill) => (
                      <tr key={bill._id} className="hover">
                        <td className="font-bold">
                          <span className="text-lg">#{bill.order?.tableNumber}</span>
                        </td>
                        <td className="font-mono">${bill.subtotal.toFixed(2)}</td>
                        <td className="font-mono">${bill.tax.toFixed(2)}</td>
                        <td className="font-mono text-success">
                          +${bill.tip.toFixed(2)}
                        </td>
                        <td className="font-mono font-bold text-success">
                          ${bill.total.toFixed(2)}
                        </td>
                        <td className="uppercase text-xs font-semibold opacity-85">
                          {bill.paymentMethod}
                        </td>
                        <td>
                          <StatusBadge status={bill.status} />
                        </td>
                        <td className="text-xs opacity-75">
                          {new Date(bill.paidAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && activeBill && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Process Payment</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => {
                  setShowPaymentModal(false);
                  setActiveBill(null);
                }}
              >
                ✕
              </button>
            </div>
            <BillForm
              bill={activeBill}
              onClose={() => {
                setShowPaymentModal(false);
                setActiveBill(null);
              }}
              onSubmit={handleProcessPayment}
              saving={submittingPayment}
            />
          </div>
        </dialog>
      )}
    </div>
  );
}
