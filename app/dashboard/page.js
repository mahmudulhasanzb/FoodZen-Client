"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/staff/me`,
          { credentials: "include" }
        );
        if (res.ok) {
          const json = await res.json();
          if (json.data.role === "kitchen") {
            router.replace("/dashboard/kitchen");
            return;
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    checkRole();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="opacity-70">Overview widgets coming soon.</p>
    </div>
  );
}
