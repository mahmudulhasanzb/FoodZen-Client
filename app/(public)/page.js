import Link from "next/link";

export default function HomePage() {
  return (
    <div className="hero min-h-[70vh] bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">FoodZen</h1>
          <p className="py-6 opacity-80">
            Great food, warm atmosphere. Browse our menu or reserve a table
            today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/menu" className="btn btn-primary">
              View Menu
            </Link>
            <Link href="/reserve" className="btn btn-outline">
              Reserve a Table
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
