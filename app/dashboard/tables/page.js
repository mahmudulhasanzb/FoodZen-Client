"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import TableGrid from "@/components/tables/TableGrid";

export default function TablesPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add table modal
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formNumber, setFormNumber] = useState("");
  const [formCapacity, setFormCapacity] = useState("");
  const [formZone, setFormZone] = useState("");

  // Staff role (for permission checks)
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchRole();
  }, []);

  async function fetchRole() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/staff/me`,
        { credentials: "include" }
      );
      if (res.ok) {
        const json = await res.json();
        setRole(json.data.role);
      }
    } catch {
      // silent
    }
  }

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const json = await apiGet("/api/tables");
      setTables(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Auto-clear success
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const canManage = role === "admin" || role === "manager";
  const canChangeStatus = canManage || role === "server";

  async function handleStatusChange(tableId, newStatus) {
    try {
      await apiPatch(`/api/tables/${tableId}`, { status: newStatus });
      setSuccess("Table status updated");
      fetchTables();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddTable(e) {
    e.preventDefault();
    setError("");

    const num = parseInt(formNumber, 10);
    const cap = parseInt(formCapacity, 10);

    if (!num || num < 1) {
      setError("Table number must be a positive integer.");
      return;
    }
    if (!cap || cap < 1) {
      setError("Capacity must be at least 1.");
      return;
    }

    setSaving(true);
    try {
      await apiPost("/api/tables", {
        number: num,
        capacity: cap,
        zone: formZone.trim(),
      });
      setSuccess(`Table #${num} created`);
      setShowModal(false);
      setFormNumber("");
      setFormCapacity("");
      setFormZone("");
      fetchTables();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Stats
  const available = tables.filter((t) => t.status === "available").length;
  const occupied = tables.filter((t) => t.status === "occupied").length;
  const reserved = tables.filter((t) => t.status === "reserved").length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tables</h1>
          <p className="text-sm opacity-60 mt-1">
            {tables.length} table{tables.length !== 1 ? "s" : ""} —{" "}
            <span className="text-success font-medium">{available} free</span>,{" "}
            <span className="text-error font-medium">{occupied} occupied</span>,{" "}
            <span className="text-warning font-medium">{reserved} reserved</span>
          </p>
        </div>
        {canManage && (
          <button
            className="btn btn-primary cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            + Add Table
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

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Table Grid */}
      {!loading && (
        <TableGrid
          tables={tables}
          onStatusChange={canChangeStatus ? handleStatusChange : undefined}
          canEdit={canChangeStatus}
        />
      )}

      {/* Add Table Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold mb-4">Add New Table</h3>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Table Number *
                  </span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="e.g. 1"
                  min="1"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Capacity (seats) *
                  </span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="e.g. 4"
                  min="1"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Zone</span>
                </label>
                <select
                  className="select select-bordered w-full cursor-pointer"
                  value={formZone}
                  onChange={(e) => setFormZone(e.target.value)}
                >
                  <option value="">No zone</option>
                  <option value="main">Main</option>
                  <option value="patio">Patio</option>
                  <option value="bar">Bar</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost cursor-pointer"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary cursor-pointer"
                  disabled={saving}
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Add Table"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowModal(false)}
          />
        </dialog>
      )}
    </div>
  );
}
