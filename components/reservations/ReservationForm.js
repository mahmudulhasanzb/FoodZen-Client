"use client";

import { useState } from "react";

export default function ReservationForm({ onSubmit, saving, initialData = {} }) {
  const [customerName, setCustomerName] = useState(initialData.customerName || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [partySize, setPartySize] = useState(initialData.partySize || 2);
  const [date, setDate] = useState(initialData.date || "");
  const [time, setTime] = useState(initialData.time || "");
  const [notes, setNotes] = useState(initialData.notes || "");
  const [validationError, setValidationError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setValidationError("");

    if (!customerName.trim()) {
      setValidationError("Guest name is required");
      return;
    }
    if (!phone.trim()) {
      setValidationError("Phone number is required");
      return;
    }
    if (!partySize || partySize < 1) {
      setValidationError("Party size must be at least 1 person");
      return;
    }
    if (!date) {
      setValidationError("Reservation date is required");
      return;
    }
    if (!time) {
      setValidationError("Reservation time is required");
      return;
    }

    onSubmit({
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      partySize: Number(partySize),
      date,
      time,
      notes: notes.trim(),
    });
  }

  // Helper to get today's date in YYYY-MM-DD for min date limit
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationError && (
        <div className="alert alert-error text-sm p-3 rounded-lg shadow-sm">
          <span>{validationError}</span>
        </div>
      )}

      {/* Guest Name & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text font-semibold">Guest Name</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="John Doe"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            disabled={saving}
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text font-semibold">Phone Number</span>
          </label>
          <input
            type="tel"
            className="input input-bordered w-full"
            placeholder="(123) 456-7890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={saving}
            required
          />
        </div>
      </div>

      {/* Email & Party Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text font-semibold">Email (Optional)</span>
          </label>
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text font-semibold">Number of Guests</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={partySize}
            onChange={(e) => setPartySize(Number(e.target.value))}
            disabled={saving}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "Guest" : "Guests"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text font-semibold">Preferred Date</span>
          </label>
          <input
            type="date"
            min={todayStr}
            className="input input-bordered w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={saving}
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text font-semibold">Preferred Time</span>
          </label>
          <input
            type="time"
            className="input input-bordered w-full"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            disabled={saving}
            required
          />
        </div>
      </div>

      {/* Special Notes */}
      <div className="form-control w-full">
        <label className="label pb-1">
          <span className="label-text font-semibold">Special Requests (Optional)</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full h-24"
          placeholder="E.g., High chair needed, celebrating a birthday, patio seating request..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={saving}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="btn btn-primary w-full cursor-pointer"
          disabled={saving}
        >
          {saving ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            "Reserve Table"
          )}
        </button>
      </div>
    </form>
  );
}
