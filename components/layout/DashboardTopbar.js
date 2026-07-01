"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

export default function DashboardTopbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [staffName, setStaffName] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/staff/me`,
          { credentials: "include" }
        );
        if (res.ok) {
          const json = await res.json();
          setStaffName(json.data.name);
        }
      } catch {
        // silent
      }
    }
    if (session?.user) {
      fetchStaff();
    }
  }, [session]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-4 min-h-14">
      {/* Mobile brand */}
      <div className="flex-1 md:hidden">
        <span className="font-bold text-primary">FoodZen</span>
      </div>

      <div className="flex-1 hidden md:block" />

      {/* Right side */}
      <div className="flex-none gap-3 flex items-center">
        {staffName && (
          <span className="text-sm opacity-70 hidden sm:inline">
            {staffName}
          </span>
        )}
        <button
          type="button"
          className="btn btn-ghost btn-sm cursor-pointer"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Logout"
          )}
        </button>
      </div>
    </header>
  );
}
