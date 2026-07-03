"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ReportsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

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

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all bills
      const json = await apiGet("/api/bills");
      setBills(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    fetchBills();
  }, [fetchStaff, fetchBills]);

  const canViewReports = staffRole === "admin" || staffRole === "manager";

  if (!canViewReports && staffRole !== null) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⛔</div>
        <h2 className="text-2xl font-bold text-error">Access Denied</h2>
        <p className="opacity-60 mt-2">
          Your role does not have permission to view reports.
        </p>
      </div>
    );
  }

  // Filter bills to only show paid ones matching the selected date
  const filteredBills = bills.filter((b) => {
    if (b.status !== "paid" || !b.paidAt) return false;
    const paidLocalDate = new Date(b.paidAt).toISOString().split("T")[0];
    return paidLocalDate === filterDate;
  });

  // Calculate operational stats for that date
  const ordersCount = filteredBills.length;
  const totalRevenue = filteredBills.reduce((sum, b) => sum + b.total, 0);
  const totalTips = filteredBills.reduce((sum, b) => sum + (b.tip || 0), 0);
  const averageTicket = ordersCount > 0 ? totalRevenue / ordersCount : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Business Reports</h1>
          <p className="text-sm opacity-60 mt-1">
            Review completed settlements, revenue metrics, and tips.
          </p>
        </div>

        {/* Date Filter */}
        <div className="form-control">
          <label className="label pt-0 pb-1">
            <span className="label-text font-semibold text-xs">Select Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered input-sm font-mono"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-ghost btn-xs" onClick={fetchBills}>
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {!loading && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Revenue */}
            <div className="bg-success/15 border border-success/20 p-5 rounded-2xl space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-success">
                Revenue
              </span>
              <p className="text-3xl font-extrabold font-mono text-success">
                ${totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs opacity-60">Paid total of settlements</p>
            </div>

            {/* Card 2: Orders Count */}
            <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Settled Orders
              </span>
              <p className="text-3xl font-extrabold font-mono text-primary">
                {ordersCount}
              </p>
              <p className="text-xs opacity-60">Completed transactions</p>
            </div>

            {/* Card 3: Tips */}
            <div className="bg-warning/10 border border-warning/20 p-5 rounded-2xl space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-warning-content">
                Total Tips
              </span>
              <p className="text-3xl font-extrabold font-mono text-warning-content">
                ${totalTips.toFixed(2)}
              </p>
              <p className="text-xs opacity-60">Gratuity recorded</p>
            </div>

            {/* Card 4: Avg Ticket */}
            <div className="bg-neutral/10 border border-neutral/20 p-5 rounded-2xl space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Avg Ticket
              </span>
              <p className="text-3xl font-extrabold font-mono opacity-80">
                ${averageTicket.toFixed(2)}
              </p>
              <p className="text-xs opacity-60">Average order spend</p>
            </div>
          </div>

          {/* Paid Settlements Table */}
          <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
            <div className="p-4 bg-base-200 border-b border-base-300">
              <h3 className="font-bold text-lg">Settled Bills for {filterDate}</h3>
            </div>

            {filteredBills.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-30">💸</div>
                <h4 className="text-lg font-bold opacity-60">
                  No Settlements Recorded
                </h4>
                <p className="opacity-40 mt-1">
                  There are no paid bills found for this date.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full align-middle">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Table</th>
                      <th>Order Total</th>
                      <th>Tax (8%)</th>
                      <th>Tip</th>
                      <th>Total Paid</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBills.map((bill) => (
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
                        <td className="uppercase text-xs font-semibold opacity-80">
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
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
