export default async function OrderTrackPage({ params }) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Order Status</h1>
      <p className="opacity-70">Tracking order {id} — coming soon.</p>
    </div>
  );
}
