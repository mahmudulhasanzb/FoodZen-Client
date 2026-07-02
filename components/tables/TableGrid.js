"use client";

import StatusBadge from "@/components/ui/StatusBadge";

/**
 * Color map for table card borders/backgrounds per status.
 */
const STATUS_CARD_STYLES = {
  available: "border-success/30 bg-success/5",
  occupied: "border-error/30 bg-error/5",
  reserved: "border-warning/30 bg-warning/5",
};

export default function TableGrid({ tables, onStatusChange, canEdit }) {
  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 opacity-20">🪑</div>
        <h2 className="text-xl font-semibold opacity-60">No tables yet</h2>
        <p className="opacity-40 mt-1">Add your first table to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {tables.map((table) => {
        const cardStyle =
          STATUS_CARD_STYLES[table.status] || "border-base-300";
        return (
          <div
            key={table._id}
            className={`card border-2 ${cardStyle} transition-all duration-200 hover:shadow-md`}
          >
            <div className="card-body p-4 items-center text-center gap-2">
              {/* Table number — big */}
              <h2 className="text-2xl font-bold">#{table.number}</h2>

              {/* Status badge */}
              <StatusBadge status={table.status} />

              {/* Capacity */}
              <p className="text-xs opacity-60">
                {table.capacity} seat{table.capacity !== 1 ? "s" : ""}
              </p>

              {/* Zone */}
              {table.zone && (
                <span className="badge badge-ghost badge-xs capitalize">
                  {table.zone}
                </span>
              )}

              {/* Status override */}
              {canEdit && onStatusChange && (
                <select
                  className="select select-bordered select-xs w-full mt-2 cursor-pointer"
                  value={table.status}
                  onChange={(e) =>
                    onStatusChange(table._id, e.target.value)
                  }
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="reserved">Reserved</option>
                </select>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
