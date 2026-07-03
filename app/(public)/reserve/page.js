"use client";

import { useState } from "react";
import ReservationForm from "@/components/reservations/ReservationForm";
import { apiPost } from "@/lib/api";
import Link from "next/link";

export default function ReservePage() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [bookedData, setBookedData] = useState(null);

  async function handleReservationSubmit(formData) {
    setSaving(true);
    setError("");
    try {
      const json = await apiPost("/api/reservations", formData);
      setBookedData(json.data);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      {!success ? (
        <div className="card bg-base-100 border border-base-300 shadow-xl rounded-2xl">
          <div className="card-body p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">Reserve a Table</h1>
              <p className="text-sm opacity-60">
                Book your table at FoodZen. We will confirm your request shortly.
              </p>
            </div>

            {error && (
              <div className="alert alert-error text-sm p-3 rounded-lg shadow-sm">
                <span>{error}</span>
              </div>
            )}

            <ReservationForm onSubmit={handleReservationSubmit} saving={saving} />
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 border border-base-300 shadow-xl rounded-2xl text-center">
          <div className="card-body p-8 space-y-6">
            <div className="text-6xl">🎉</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-success">Reservation Requested!</h2>
              <p className="text-sm opacity-60">
                Thank you, {bookedData?.customerName}. We have received your request.
              </p>
            </div>

            <div className="bg-base-200 p-4 rounded-xl space-y-2 text-left text-sm">
              <div className="flex justify-between">
                <span className="opacity-60">Date:</span>
                <span className="font-semibold">{bookedData?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Time:</span>
                <span className="font-semibold">{bookedData?.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Guests:</span>
                <span className="font-semibold">{bookedData?.partySize} People</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Status:</span>
                <span className="badge badge-warning badge-sm font-semibold capitalize">
                  {bookedData?.status}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link href="/menu" className="btn btn-primary w-full">
                Browse the Menu
              </Link>
              <Link href="/" className="btn btn-ghost w-full">
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
