export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  SERVER: "server",
  KITCHEN: "kitchen",
};

// Which roles can access each dashboard page
export const PAGE_ROLES = {
  "/dashboard": ["admin", "manager", "server", "kitchen"],
  "/dashboard/menu": ["admin", "manager"],
  "/dashboard/tables": ["admin", "manager", "server"],
  "/dashboard/orders": ["admin", "manager", "server"],
  "/dashboard/kitchen": ["admin", "manager", "kitchen"],
  "/dashboard/reservations": ["admin", "manager", "server"],
  "/dashboard/billing": ["admin", "manager", "server"],
  "/dashboard/staff": ["admin"],
  "/dashboard/reports": ["admin", "manager"],
};

/**
 * Check if a role has access to given required roles
 */
export function hasAccess(userRole, requiredRoles) {
  if (!userRole || !requiredRoles) return false;
  return requiredRoles.includes(userRole);
}

/**
 * Get sidebar links filtered by role
 */
export function getNavLinksForRole(role) {
  const allLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "home" },
    { href: "/dashboard/menu", label: "Menu", icon: "menu" },
    { href: "/dashboard/tables", label: "Tables", icon: "table" },
    { href: "/dashboard/orders", label: "Orders", icon: "orders" },
    { href: "/dashboard/kitchen", label: "Kitchen", icon: "kitchen" },
    { href: "/dashboard/reservations", label: "Reservations", icon: "calendar" },
    { href: "/dashboard/billing", label: "Billing", icon: "billing" },
    { href: "/dashboard/staff", label: "Staff", icon: "staff" },
    { href: "/dashboard/reports", label: "Reports", icon: "reports" },
  ];

  return allLinks.filter((link) => {
    const allowed = PAGE_ROLES[link.href];
    return allowed && allowed.includes(role);
  });
}
