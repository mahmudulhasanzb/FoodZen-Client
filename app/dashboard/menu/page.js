"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import MenuItemForm from "@/components/menu/MenuItemForm";

export default function MenuManagerPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filter
  const [filterCategory, setFilterCategory] = useState("All");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const json = await apiGet("/api/menu/all");
      setItems(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Auto-clear success msg
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  async function handleCreate(data) {
    setSaving(true);
    setError("");
    try {
      await apiPost("/api/menu", data);
      setSuccess("Menu item created!");
      setShowModal(false);
      fetchItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data) {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      await apiPatch(`/api/menu/${editing._id}`, data);
      setSuccess("Menu item updated!");
      setShowModal(false);
      setEditing(null);
      fetchItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAvailable(item) {
    try {
      await apiPatch(`/api/menu/${item._id}`, {
        available: !item.available,
      });
      setSuccess(
        `${item.name} marked ${item.available ? "unavailable" : "available"}`
      );
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/menu/${deleteId}`);
      setSuccess("Item deleted");
      setDeleteId(null);
      fetchItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(item) {
    setEditing(item);
    setShowModal(true);
  }

  // Categories
  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => i.category))).sort(),
  ];
  const filtered =
    filterCategory === "All"
      ? items
      : items.filter((i) => i.category === filterCategory);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Menu Manager</h1>
          <p className="text-sm opacity-60 mt-1">
            {items.length} item{items.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          className="btn btn-primary cursor-pointer"
          onClick={openCreate}
        >
          + Add Item
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

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm cursor-pointer ${
                filterCategory === cat ? "btn-primary" : "btn-ghost"
              }`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-20">📋</div>
          <h2 className="text-xl font-semibold opacity-60">
            No menu items yet
          </h2>
          <p className="opacity-40 mt-1">
            Add your first item to get started.
          </p>
        </div>
      )}

      {/* Items Table */}
      {!loading && filtered.length > 0 && (
        <div className="overflow-x-auto border border-base-300 rounded-xl">
          <table className="table table-zebra">
            <thead>
              <tr className="bg-base-200">
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item._id} className="hover">
                  <td>
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-lg">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                            />
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-xs opacity-50 max-w-xs truncate">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-outline badge-sm capitalize">
                      {item.category}
                    </span>
                  </td>
                  <td className="font-mono">
                    ${item.price.toFixed(2)}
                  </td>
                  <td>
                    <label className="swap cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.available !== false}
                        onChange={() => handleToggleAvailable(item)}
                      />
                      <span className="swap-on badge badge-success badge-sm">
                        Available
                      </span>
                      <span className="swap-off badge badge-error badge-sm">
                        Unavailable
                      </span>
                    </label>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        className="btn btn-ghost btn-xs cursor-pointer"
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error cursor-pointer"
                        onClick={() => setDeleteId(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold mb-4">
              {editing ? "Edit Menu Item" : "Add Menu Item"}
            </h3>
            <MenuItemForm
              item={editing}
              loading={saving}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowModal(false);
                setEditing(null);
              }}
            />
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowModal(false);
              setEditing(null);
            }}
          />
        </dialog>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Delete Menu Item?</h3>
            <p className="py-4 opacity-70">
              This action cannot be undone. The item will be permanently
              removed.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost cursor-pointer"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-error cursor-pointer"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteId(null)} />
        </dialog>
      )}
    </div>
  );
}
