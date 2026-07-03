"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter date — default to today's date in YYYY-MM-DD
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Modal / Action State
  const [selectedRes, setSelectedRes] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

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

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = filterDate ? `?date=${filterDate}` : "";
      const json = await apiGet(`/api/reservations${query}`);
      setReservations(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  const fetchTables = useCallback(async () => {
    try {
      const json = await apiGet("/api/tables");
      setTables(json.data || []);
    } catch (err) {
      console.error("Failed to fetch tables", err);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, [fetchReservations, fetchTables]);

  // Auto-clear success messages
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // Open confirmation / table assignment modal
  function openConfirmModal(resRecord) {
    setSelectedRes(resRecord);
    setSelectedTableId(resRecord.tableId || "");
    setShowConfirmModal(true);
  }

  // Handle confirm & assign table
  async function handleConfirmReservation(e) {
    e.preventDefault();
    if (!selectedRes || !selectedTableId) return;

    setSubmittingAction(true);
    setError("");
    try {
      await apiPatch(`/api/reservations/${selectedRes._id}`, {
        status: "confirmed",
        tableId: selectedTableId,
      });
      setSuccess("Reservation confirmed and table assigned!");
      setShowConfirmModal(false);
      setSelectedRes(null);
      fetchReservations();
      fetchTables();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  }

  // Handle seat guest
  async function handleSeatGuest(resId) {
    setError("");
    try {
      await apiPatch(`/api/reservations/${resId}`, {
        status: "seated",
      });
      setSuccess("Guests seated. Assigned table status set to occupied.");
      fetchReservations();
      fetchTables();
    } catch (err) {
      setError(err.message);
    }
  }

  // Handle cancel reservation
  async function handleCancelReservation(resId) {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    setError("");
    try {
      await apiPatch(`/api/reservations/${resId}`, {
        status: "cancelled",
      });
      setSuccess("Reservation cancelled.");
      fetchReservations();
      fetchTables();
    } catch (err) {
      setError(err.message);
    }
  }

  // Filter available tables with capacity >= party size of chosen reservation
  const matchingTables = tables.filter(
    (t) => t.status === "available" && t.capacity >= (selectedRes?.partySize || 0)
  );

  const canManageReservations =
    staffRole === "admin" || staffRole === "manager" || staffRole === "server";

  if (!canManageReservations && staffRole !== null) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⛔</div>
        <h2 className="text-2xl font-bold text-error">Access Denied</h2>
        <p className="opacity-60 mt-2">
          Your role does not have permission to view reservations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reservations Management</h1>
          <p className="text-sm opacity-60 mt-1">
            Confirm customer requests, assign tables, and seat guests.
          </p>
        </div>

        {/* Date Filter */}
        <div className="form-control">
          <label className="label pt-0 pb-1">
            <span className="label-text font-semibold text-xs">Filter by Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered input-sm font-mono"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
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

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Reservations List */}
      {!loading && (
        <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
          {reservations.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No Reservations for this Date"
              description="Select a different date or check customer bookings."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full align-middle">
                <thead>
                  <tr className="bg-base-200">
                    <th>Guest</th>
                    <th>Contact</th>
                    <th>Size</th>
                    <th>Time</th>
                    <th>Assigned Table</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((resRecord) => (
                    <tr key={resRecord._id} className="hover align-top">
                      <td className="font-bold">
                        <div>{resRecord.customerName}</div>
                        {resRecord.notes && (
                          <div className="text-xs font-normal opacity-60 italic mt-1 max-w-xs truncate">
                            “{resRecord.notes}”
                          </div>
                        )}
                      </td>
                      <td className="text-xs">
                        <div>📞 {resRecord.phone}</div>
                        {resRecord.email && (
                          <div className="opacity-60 mt-0.5">✉️ {resRecord.email}</div>
                        )}
                      </td>
                      <td className="font-semibold">{resRecord.partySize} Pax</td>
                      <td className="font-mono text-sm font-semibold">{resRecord.time}</td>
                      <td>
                        {resRecord.table ? (
                          <div className="font-semibold text-primary">
                            Table #{resRecord.table.number}{" "}
                            <span className="text-xs opacity-60 font-normal">
                              ({resRecord.table.zone}, Cap: {resRecord.table.capacity})
                            </span>
                          </div>
                        ) : (
                          <span className="opacity-40 italic">Not Assigned</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={resRecord.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1 flex-wrap">
                          {resRecord.status === "pending" && (
                            <>
                              <button
                                className="btn btn-primary btn-xs cursor-pointer"
                                onClick={() => openConfirmModal(resRecord)}
                              >
                                Confirm
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error cursor-pointer"
                                onClick={() => handleCancelReservation(resRecord._id)}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {resRecord.status === "confirmed" && (
                            <>
                              <button
                                className="btn btn-success btn-xs text-success-content cursor-pointer"
                                onClick={() => handleSeatGuest(resRecord._id)}
                              >
                                Seat Guest
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error cursor-pointer"
                                onClick={() => handleCancelReservation(resRecord._id)}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {(resRecord.status === "seated" ||
                            resRecord.status === "cancelled") && (
                            <span className="text-xs opacity-40 font-normal italic pr-2">
                              Closed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation & Table Assignment Modal */}
      {showConfirmModal && selectedRes && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold mb-4">Confirm & Assign Table</h3>
            
            <div className="bg-base-200 p-4 rounded-xl mb-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="opacity-60">Guest Name:</span>
                <span className="font-semibold">{selectedRes.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Party Size:</span>
                <span className="font-bold">{selectedRes.partySize} Pax</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Request Time:</span>
                <span className="font-semibold">{selectedRes.time}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmReservation} className="space-y-4">
              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-semibold">Assign Available Table</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    -- Select Table --
                  </option>
                  {matchingTables.map((t) => (
                    <option key={t._id} value={t._id}>
                      Table #{t.number} ({t.zone}) - Capacity: {t.capacity}
                    </option>
                  ))}
                </select>
                {matchingTables.length === 0 && (
                  <p className="text-xs text-error mt-2">
                    No available tables found matching or exceeding capacity of {selectedRes.partySize}.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost cursor-pointer"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedRes(null);
                  }}
                  disabled={submittingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary cursor-pointer px-6"
                  disabled={submittingAction || !selectedTableId}
                >
                  {submittingAction ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}
