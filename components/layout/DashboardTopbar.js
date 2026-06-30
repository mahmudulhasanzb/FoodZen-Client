export default function DashboardTopbar() {
  return (
    <header className="navbar bg-base-100 border-b border-base-300 px-4 min-h-14">
      <div className="flex-1 md:hidden">
        <span className="font-bold text-primary">FoodZen</span>
      </div>
      <div className="flex-none gap-2">
        <span className="text-sm opacity-70 hidden sm:inline">Staff</span>
        <button type="button" className="btn btn-ghost btn-sm" disabled>
          Logout
        </button>
      </div>
    </header>
  );
}
