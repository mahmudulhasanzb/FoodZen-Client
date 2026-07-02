"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";

export default function OrderForm({ order, onSubmit, onCancel, loading }) {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);
        const [tablesRes, menuRes] = await Promise.all([
          apiGet("/api/tables"),
          apiGet("/api/menu"), // only available ones
        ]);
        setTables(tablesRes.data || []);
        setMenuItems(menuRes.data || []);
      } catch (err) {
        setError("Failed to load tables or menu items.");
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (order) {
      setSelectedTableId(order.tableId || "");
      setSelectedItems(
        order.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          qty: i.qty,
        })) || []
      );
      setNotes(order.notes || "");
    } else {
      setSelectedTableId("");
      setSelectedItems([]);
      setNotes("");
    }
    setError("");
  }, [order]);

  function handleAddItem(menuItem) {
    const existing = selectedItems.find((i) => i.menuItemId === menuItem._id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.menuItemId === menuItem._id ? { ...i, qty: i.qty + 1 } : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          qty: 1,
        },
      ]);
    }
  }

  function handleRemoveItem(menuItemId) {
    setSelectedItems(selectedItems.filter((i) => i.menuItemId !== menuItemId));
  }

  function handleQtyChange(menuItemId, newQty) {
    if (newQty < 1) return;
    setSelectedItems(
      selectedItems.map((i) =>
        i.menuItemId === menuItemId ? { ...i, qty: newQty } : i
      )
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!selectedTableId) {
      setError("Please select a table.");
      return;
    }
    if (selectedItems.length === 0) {
      setError("Please add at least one item to the order.");
      return;
    }

    onSubmit({
      tableId: selectedTableId,
      items: selectedItems,
      notes: notes.trim(),
    });
  }

  const orderTotal = selectedItems.reduce((acc, i) => acc + i.price * i.qty, 0);

  // If creating new order, show only available tables. If editing, also allow current table.
  const selectableTables = tables.filter(
    (t) => t.status === "available" || (order && t._id === order.tableId)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      {loadingOptions ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : (
        <>
          {/* Table selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Select Table *</span>
            </label>
            <select
              className="select select-bordered w-full cursor-pointer"
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              required
            >
              <option value="" disabled>
                Choose a table...
              </option>
              {selectableTables.map((t) => (
                <option key={t._id} value={t._id}>
                  Table #{t.number} ({t.capacity} seats) {t.zone ? ` - ${t.zone}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Menu selection grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Menu Items Quick Pick */}
            <div className="border border-base-300 rounded-xl p-4 bg-base-50">
              <h4 className="font-bold text-sm mb-3">Add Items to Order</h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {menuItems.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    className="flex justify-between items-center w-full p-2 bg-base-100 hover:bg-base-200 border border-base-200 rounded-lg text-left text-xs cursor-pointer transition-colors"
                    onClick={() => handleAddItem(item)}
                  >
                    <div>
                      <span className="font-semibold block">{item.name}</span>
                      <span className="opacity-60">{item.category}</span>
                    </div>
                    <span className="font-mono font-bold">${item.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Items / Current Order */}
            <div className="border border-base-300 rounded-xl p-4 bg-base-50 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm mb-3">Current Selection</h4>
                {selectedItems.length === 0 ? (
                  <p className="text-xs opacity-50 text-center py-8">
                    No items selected. Click menu items to add them.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {selectedItems.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex justify-between items-center text-xs p-2 bg-base-100 border border-base-200 rounded-lg"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <span className="font-semibold block truncate">{item.name}</span>
                          <span className="opacity-60 font-mono">
                            ${item.price.toFixed(2)} each
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="input input-bordered input-xs w-12 text-center"
                            min="1"
                            value={item.qty}
                            onChange={(e) =>
                              handleQtyChange(item.menuItemId, parseInt(e.target.value, 10))
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-error cursor-pointer"
                            onClick={() => handleRemoveItem(item.menuItemId)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedItems.length > 0 && (
                <div className="border-t border-base-300 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-semibold text-xs">Total:</span>
                  <span className="font-mono font-bold text-sm text-primary">
                    ${orderTotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Special Notes / Allergies</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="e.g. No onions, gluten free..."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <button
                type="button"
                className="btn btn-ghost cursor-pointer"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : order ? (
                "Update Order"
              ) : (
                "Create Order"
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
