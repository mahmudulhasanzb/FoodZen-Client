"use client";

export default function MenuCard({ item }) {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      {/* Image */}
      {item.imageUrl && (
        <figure className="relative overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </figure>
      )}

      <div className="card-body p-5">
        {/* Category badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="badge badge-outline badge-sm capitalize opacity-70">
            {item.category}
          </span>
          {!item.available && (
            <span className="badge badge-error badge-sm">Unavailable</span>
          )}
        </div>

        {/* Name */}
        <h3 className="card-title text-lg mt-1">{item.name}</h3>

        {/* Description */}
        {item.description && (
          <p className="text-sm opacity-60 line-clamp-2">{item.description}</p>
        )}

        {/* Price */}
        <div className="card-actions justify-end mt-2">
          <span className="text-lg font-bold text-primary">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
