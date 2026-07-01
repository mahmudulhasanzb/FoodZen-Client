"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getNavLinksForRole } from "@/lib/roles";
import { useEffect, useState } from "react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [staffRole, setStaffRole] = useState(null);
  const [staffName, setStaffName] = useState("");

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/staff/me`,
          { credentials: "include" }
        );
        if (res.ok) {
          const json = await res.json();
          setStaffRole(json.data.role);
          setStaffName(json.data.name);
        }
      } catch {
        // silent — sidebar will show no links
      }
    }
    if (session?.user) {
      fetchStaff();
    }
  }, [session]);

  const navLinks = staffRole ? getNavLinksForRole(staffRole) : [];

  return (
    <aside className="w-60 min-h-screen bg-base-200 border-r border-base-300 hidden md:flex flex-col">
      {/* Brand */}
      <div className="p-5 border-b border-base-300">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-primary tracking-tight cursor-pointer"
        >
          FoodZen
        </Link>
        <p className="text-xs opacity-60 mt-1">Staff Dashboard</p>
      </div>

      {/* Staff Info */}
      {staffName && (
        <div className="px-5 py-3 border-b border-base-300">
          <p className="text-sm font-medium truncate">{staffName}</p>
          <span className="badge badge-outline badge-sm mt-1 capitalize">
            {staffRole}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3">
        <ul className="menu px-3 gap-0.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-primary text-primary-content font-medium"
                      : "hover:bg-base-300"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-base-300">
        <Link
          href="/"
          className="btn btn-ghost btn-sm w-full justify-start text-xs opacity-60 cursor-pointer"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
