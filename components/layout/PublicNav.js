import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function PublicNav() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });
  const session = sessionData?.session;

  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-4">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl font-bold text-primary">
          FoodZen
        </Link>
      </div>
      <nav className="flex-none gap-2">
        <Link href="/menu" className="btn btn-ghost btn-sm">
          Menu
        </Link>
        <Link href="/reserve" className="btn btn-primary btn-sm">
          Reserve
        </Link>
        {
          session ? (
            <Link href="/dashboard" className="btn btn-ghost btn-sm">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
          )
        }
      </nav>
    </header>
  );
}

