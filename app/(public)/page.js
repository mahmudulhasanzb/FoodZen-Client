import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[80vh] justify-center items-center py-12 px-4 space-y-12">
      {/* Hero Section - Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl w-full mx-auto">
        {/* Left Side: Texts */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-primary">
            FoodZen
          </h1>
          <p className="text-xl opacity-80 leading-relaxed max-w-lg">
            Premium culinary experience in a warm, welcoming atmosphere. Browse our seasonal menu or reserve your table today.
          </p>
          <div className="flex gap-4 justify-start flex-wrap pt-2">
            <Link href="/menu" className="btn btn-primary btn-lg cursor-pointer">
              📖 Browse Menu
            </Link>
            <Link href="/reserve" className="btn btn-outline btn-lg cursor-pointer">
              📅 Reserve a Table
            </Link>
          </div>
        </div>

        {/* Right Side: Restaurant Image */}
        <div className="lg:col-span-5 w-full">
          <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden border border-base-300 shadow-sm bg-base-200">
            <img 
              src="https://i.ibb.co/qy0P65H/restaurant.jpg" 
              alt="Zen Restaurant" 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
            />
          </div>
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
