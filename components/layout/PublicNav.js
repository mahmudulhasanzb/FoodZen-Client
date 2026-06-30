import Link from "next/link";

export default function PublicNav() {
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
        <Link href="/login" className="btn btn-ghost btn-sm">
          Staff Login
        </Link>
      </nav>
    </header>
  );
}
