"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";

export default function StaffPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Current user role
  const [currentUser, setCurrentUser] = useState(null);

  // Add staff form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("server");
  const [submitting, setSubmitting] = useState(false);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/staff/me`,
        { credentials: "include" }
      );
      if (res.ok) {
        const json = await res.json();
        setCurrentUser(json.data);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchStaffList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const json = await apiGet("/api/staff");
      setStaffList(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchStaffList();
    }
  }, [currentUser, fetchStaffList]);

  // Auto-clear success messages
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // Handle adding staff
  async function handleAddStaff(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiPost("/api/staff", {
        name,
        email,
        password,
        role,
      });
      setSuccess("New staff registered successfully!");
      setShowAddModal(false);
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("server");
      fetchStaffList();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Toggle staff active status
  async function handleToggleStatus(staffMember) {
    setError("");
    try {
      await apiPatch(`/api/staff/${staffMember._id}`, {
        active: !staffMember.active,
      });
      setSuccess(`Staff status updated successfully!`);
      fetchStaffList();
    } catch (err) {
      setError(err.message);
    }
  }

  const isAdmin = currentUser?.role === "admin";

  if (!isAdmin && currentUser !== null) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⛔</div>
        <h2 className="text-2xl font-bold text-error">Access Denied</h2>
        <p className="opacity-60 mt-2">
          Only administrators have permission to manage staff.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Staff Directory</h1>
          <p className="text-sm opacity-60 mt-1">
            Register new staff accounts, manage roles, and toggle active status.
          </p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary cursor-pointer btn-sm sm:btn-md"
            onClick={() => setShowAddModal(true)}
          >
            + Register Staff
          </button>
        )}
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

      {/* Staff List Table */}
      {!loading && isAdmin && (
        <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full align-middle">
              <thead>
                <tr className="bg-base-200">
                  <th>Name</th>
                  <th>User ID</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined At</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((member) => (
                  <tr key={member._id} className="hover">
                    <td className="font-bold">{member.name}</td>
                    <td className="font-mono text-xs opacity-60">{member.userId}</td>
                    <td className="capitalize">
                      <span
                        className={`badge ${
                          member.role === "admin"
                            ? "badge-primary"
                            : member.role === "manager"
                            ? "badge-secondary"
                            : member.role === "server"
                            ? "badge-info"
                            : "badge-neutral"
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          member.active ? "badge-success" : "badge-error"
                        }`}
                      >
                        {member.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-xs opacity-75">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      {member.userId !== currentUser.userId ? (
                        <button
                          className={`btn btn-xs cursor-pointer ${
                            member.active ? "btn-outline btn-error" : "btn-success"
                          }`}
                          onClick={() => handleToggleStatus(member)}
                        >
                          {member.active ? "Deactivate" : "Activate"}
                        </button>
                      ) : (
                        <span className="text-xs opacity-40 font-normal italic pr-2">
                          Current Account
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Register Staff Account</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-semibold">Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="jane.doe@foodzen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-semibold">Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={submitting}
                />
              </div>

              <div className="form-control w-full">
                <label className="label pb-1">
                  <span className="label-text font-semibold">Staff Role</span>
                </label>
                <select
                  className="select select-bordered w-full capitalize"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  disabled={submitting}
                >
                  {["admin", "manager", "server", "kitchen"].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost cursor-pointer"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary cursor-pointer px-6"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    "Register & Create"
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
