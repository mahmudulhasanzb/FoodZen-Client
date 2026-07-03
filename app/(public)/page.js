import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[80vh] justify-center items-center py-12 px-4 space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-2xl space-y-6">
        <h1 className="text-6xl font-extrabold tracking-tight text-primary">
          FoodZen
        </h1>
        <p className="text-xl opacity-80 leading-relaxed">
          Premium culinary experience in a warm, welcoming atmosphere. Browse our seasonal menu or reserve your table today.
        </p>
        <div className="flex gap-4 justify-center flex-wrap pt-2">
          <Link href="/menu" className="btn btn-primary btn-lg cursor-pointer">
            📖 Browse Menu
          </Link>
          <Link href="/reserve" className="btn btn-outline btn-lg cursor-pointer">
            📅 Reserve a Table
          </Link>
        </div>
      </div>

      {/* Info Cards (Hours & Location) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Operating Hours */}
        <div className="card bg-base-200 border border-base-300 rounded-2xl shadow-sm">
          <div className="card-body p-6 space-y-4">
            <h3 className="card-title text-xl font-bold flex items-center gap-2">
              🕒 Operating Hours
            </h3>
            <div className="divider my-0"></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold opacity-70">Monday - Friday</span>
                <span className="font-mono">11:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold opacity-70">Saturday - Sunday</span>
                <span className="font-mono">10:00 AM - 11:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold opacity-70">Kitchen Closes</span>
                <span className="font-mono text-error">45 mins before closing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="card bg-base-200 border border-base-300 rounded-2xl shadow-sm">
          <div className="card-body p-6 space-y-4">
            <h3 className="card-title text-xl font-bold flex items-center gap-2">
              📍 Location & Contact
            </h3>
            <div className="divider my-0"></div>
            <div className="space-y-2 text-sm">
              <p className="opacity-80">
                123 Gourmet Boulevard, Food District, NY 10001
              </p>
              <div className="pt-1 space-y-1">
                <p>📞 <span className="font-mono font-semibold">(555) 019-9283</span></p>
                <p>✉️ <span className="font-semibold">contact@foodzen.com</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
