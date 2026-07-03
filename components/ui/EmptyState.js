"use client";

/**
 * Reusable EmptyState component for clean, consistent lists.
 */
export default function EmptyState({ icon = "📝", title = "No data found", description = "" }) {
  return (
    <div className="text-center py-16 border border-dashed border-base-300 rounded-xl bg-base-100/50">
      <div className="text-6xl mb-4 opacity-30 select-none">{icon}</div>
      <h3 className="text-xl font-bold opacity-75">{title}</h3>
      {description && (
        <p className="opacity-50 mt-1 max-w-sm mx-auto text-sm">
          {description}
        </p>
      )}
    </div>
  );
}
