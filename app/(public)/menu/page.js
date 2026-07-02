"use client";

import { useState, useEffect } from "react";
import MenuCard from "@/components/menu/MenuCard";

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menu`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load menu");
      setItems(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Extract unique categories
  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => i.category))).sort(),
  ];

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((i) => i.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Our Menu</h1>
        <p className="opacity-60 mt-2">
          Fresh ingredients, crafted with care
        </p>
      </div>

      {/* Category Tabs */}
      {categories.length > 1 && (
        <div className="flex justify-center mb-8">
          <div role="tablist" className="tabs tabs-boxed bg-base-200 p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                className={`tab cursor-pointer transition-colors duration-200 ${
                  activeCategory === cat ? "tab-active" : ""
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-error max-w-md mx-auto">
          <span>{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-20">🍽️</div>
          <h2 className="text-xl font-semibold opacity-60">
            No menu items yet
          </h2>
          <p className="opacity-40 mt-1">
            Check back soon — we&apos;re cooking up something great!
          </p>
        </div>
      )}

      {/* Menu Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <MenuCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
