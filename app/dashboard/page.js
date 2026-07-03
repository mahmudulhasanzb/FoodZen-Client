"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState("");

  const checkRoleAndFetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch current staff details
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/staff/me`,
        { credentials: "include" }
      );
      if (!res.ok) {
        throw new Error("Failed to load staff session");
      }
      const staffJson = await res.json();
      setStaff(staffJson.data);

      // Redirect if kitchen role (has separate view)
      if (staffJson.data.role === "kitchen") {
        router.replace("/dashboard/kitchen");
        return;
      }

      // 2. Fetch reports summary data
      const summaryJson = await apiGet("/api/reports/summary");
      setSummary(summaryJson.data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkRoleAndFetchData();
  }, [checkRoleAndFetchData]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button
          className="btn btn-ghost btn-xs"
          onClick={checkRoleAndFetchData}
        >
          Retry
        </button>
      </div>
    );
  }

  const role = staff?.role;
  const isManagerOrAdmin = role === "admin" || role === "manager";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Welcome back, {staff?.name || "Staff"}
        </h1>
        <p className="text-sm opacity-60 mt-1 capitalize">
          Role: {role} — Today's Restaurant Operations at a glance.
        </p>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widget 1: Open Orders */}
        <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all rounded-2xl">
          <div className="card-body p-6 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                Open Orders
              </span>
              <p className="text-4xl font-extrabold font-mono">
                {summary?.openOrders ?? 0}
              </p>
              <p className="text-xs opacity-50">Active dine-in orders</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
              📋
            </div>
          </div>
        </div>

        {/* Widget 2: Kitchen Queue */}
        <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all rounded-2xl">
          <div className="card-body p-6 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                Kitchen Queue
              </span>
              <p className="text-4xl font-extrabold font-mono text-info">
                {summary?.kitchenOrders ?? 0}
              </p>
              <p className="text-xs opacity-50">Pending + Preparing orders</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info text-xl font-bold">
              🍳
            </div>
          </div>
        </div>

        {/* Widget 3: Table Occupancy */}
        <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all rounded-2xl">
          <div className="card-body p-6 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                Table Occupancy
              </span>
              <p className="text-4xl font-extrabold font-mono">
                {summary?.occupiedTables ?? 0}
                <span className="text-xl font-normal opacity-50">
                  /{summary?.totalTables ?? 0}
                </span>
              </p>
              <p className="text-xs opacity-50">Tables occupied right now</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center text-success text-xl font-bold">
              🪑
            </div>
          </div>
        </div>

        {/* Widget 4: Pending Reservations */}
        <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all rounded-2xl">
          <div className="card-body p-6 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                Pending Reservations
              </span>
              <p className="text-4xl font-extrabold font-mono text-warning">
                {summary?.pendingReservationsToday ?? 0}
              </p>
              <p className="text-xs opacity-50">Bookings for today</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning text-xl font-bold">
              📅
            </div>
          </div>
        </div>

        {/* Widget 5: Revenue Today (Manager / Admin Only) */}
        {isManagerOrAdmin && (
          <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all rounded-2xl">
            <div className="card-body p-6 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                  Revenue Today
                </span>
                <p className="text-4xl font-extrabold font-mono text-success">
                  ${(summary?.revenueToday ?? 0).toFixed(2)}
                </p>
                <p className="text-xs opacity-50">Paid settlements today</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center text-success text-xl font-bold">
                💰
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Navigation Panel */}
      <div className="bg-base-200 p-6 rounded-2xl border border-base-300 space-y-4">
        <h3 className="font-bold text-lg">Quick Actions</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn btn-primary cursor-pointer btn-sm"
            onClick={() => router.push("/dashboard/orders")}
          >
            Orders Board
          </button>
          <button
            className="btn btn-outline cursor-pointer btn-sm"
            onClick={() => router.push("/dashboard/tables")}
          >
            Table Map
          </button>
          <button
            className="btn btn-outline cursor-pointer btn-sm"
            onClick={() => router.push("/dashboard/reservations")}
          >
            Reservations
          </button>
          {isManagerOrAdmin && (
            <button
              className="btn btn-outline cursor-pointer btn-sm"
              onClick={() => router.push("/dashboard/reports")}
            >
              Business Reports
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
