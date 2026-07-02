"use client";

import { useState, useEffect } from "react";

export default function MenuItemForm({ item, onSubmit, onCancel, loading }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setPrice(item.price != null ? String(item.price) : "");
      setCategory(item.category || "");
      setDescription(item.description || "");
      setImageUrl(item.imageUrl || "");
    } else {
      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setImageUrl("");
    }
    setError("");
  }, [item]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !price || !category.trim()) {
      setError("Name, price, and category are required.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Price must be a non-negative number.");
      return;
    }

    onSubmit({
      name: name.trim(),
      price: parsedPrice,
      category: category.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    });
  }

  const CATEGORIES = ["Starters", "Mains", "Desserts", "Drinks"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="alert alert-error alert-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Name */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Name *</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g. Grilled Salmon"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Price */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Price ($) *</span>
        </label>
        <input
          type="number"
          className="input input-bordered w-full"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Category *</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="" disabled>
            Pick a category
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Short blurb for the menu..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Image URL */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Image URL</span>
        </label>
        <input
          type="url"
          className="input input-bordered w-full"
          placeholder="https://..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
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
          ) : item ? (
            "Update Item"
          ) : (
            "Add Item"
          )}
        </button>
      </div>
    </form>
  );
}
