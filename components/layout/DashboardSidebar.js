import Link from "next/link";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/menu", label: "Menu" },
  { href: "/dashboard/tables", label: "Tables" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/kitchen", label: "Kitchen" },
  { href: "/dashboard/reservations", label: "Reservations" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/staff", label: "Staff" },
  { href: "/dashboard/reports", label: "Reports" },
];

export default function DashboardSidebar() {
  return (
    <aside className="w-56 min-h-screen bg-base-200 border-r border-base-300 hidden md:flex flex-col">
      <div className="p-4 border-b border-base-300">
        <Link href="/dashboard" className="text-xl font-bold text-primary">
          FoodZen
        </Link>
        <p className="text-xs opacity-60 mt-1">Staff Dashboard</p>
      </div>
      <ul className="menu p-4 gap-1 flex-1">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
