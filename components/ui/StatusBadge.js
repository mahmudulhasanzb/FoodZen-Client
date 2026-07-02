"use client";

/**
 * Reusable status badge — consistent DaisyUI colors for
 * table, order, reservation, and bill statuses.
 *
 * Usage: <StatusBadge status="available" />
 */

const STATUS_STYLES = {
  // Table statuses
  available: "badge-success",
  occupied: "badge-error",
  reserved: "badge-warning",

  // Order statuses
  pending: "badge-warning",
  preparing: "badge-info",
  ready: "badge-success",
  served: "badge-neutral",
  closed: "badge-ghost",
  cancelled: "badge-error",

  // Reservation statuses
  confirmed: "badge-info",
  seated: "badge-success",
  // pending + cancelled already covered

  // Bill statuses
  open: "badge-warning",
  paid: "badge-success",
};

export default function StatusBadge({ status, size = "sm", className = "" }) {
  const style = STATUS_STYLES[status] || "badge-ghost";
  return (
    <span
      className={`badge ${style} badge-${size} capitalize ${className}`}
    >
      {status}
    </span>
  );
}
