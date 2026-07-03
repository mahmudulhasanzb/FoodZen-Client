"use client";

import { useState, useEffect } from "react";

export default function BillForm({ bill, onClose, onSubmit, saving }) {
  const [tip, setTip] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const subtotal = bill.subtotal || 0;
  const tax = bill.tax || 0;
  const total = Number((subtotal + tax + Number(tip || 0)).toFixed(2));

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      tip: Number(tip || 0),
      paymentMethod,
      status: "paid",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bill Overview Header */}
      <div className="bg-base-200 p-4 rounded-xl space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-lg">Table #{bill.order?.tableNumber}</h4>
          <span className="text-xs opacity-60">
            Order ID: {bill.orderId?.substring(18)}
          </span>
        </div>
        <div className="divider my-1"></div>
        {/* Items Summary */}
        <div className="max-h-36 overflow-y-auto space-y-1 pr-2">
          {bill.order?.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                <span className="font-semibold opacity-70">{item.qty}x</span>{" "}
                {item.name}
              </span>
              <span className="font-mono">
                ${(item.price * item.qty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calculations */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm opacity-80">
          <span>Subtotal</span>
          <span className="font-mono">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm opacity-80">
          <span>Tax (8%)</span>
          <span className="font-mono">${tax.toFixed(2)}</span>
        </div>

        {/* Tip Input */}
        <div className="form-control w-full">
          <label className="label pt-0 pb-1">
            <span className="label-text font-semibold">Tip Amount ($)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input input-bordered w-full pl-7 font-mono"
              placeholder="0.00"
              value={tip === 0 ? "" : tip}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTip(isNaN(val) ? 0 : val);
              }}
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[5, 10, 15, 20].map((pct) => {
              const suggestedTip = Number((subtotal * (pct / 100)).toFixed(2));
              return (
                <button
                  key={pct}
                  type="button"
                  className="btn btn-xs btn-outline cursor-pointer"
                  onClick={() => setTip(suggestedTip)}
                >
                  {pct}% (${suggestedTip.toFixed(2)})
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text font-semibold">Payment Method</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "card", label: "💳 Card" },
              { id: "cash", label: "💵 Cash" },
              { id: "other", label: "💼 Other" },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                className={`btn btn-outline cursor-pointer capitalize ${
                  paymentMethod === method.id ? "btn-primary border-2" : ""
                }`}
                onClick={() => setPaymentMethod(method.id)}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divider"></div>

        {/* Grand Total */}
        <div className="flex justify-between items-center text-xl font-bold bg-primary/10 p-3 rounded-xl">
          <span className="text-primary">Total to Pay</span>
          <span className="font-mono text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="btn btn-ghost cursor-pointer"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary cursor-pointer px-6"
          disabled={saving}
        >
          {saving ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Complete Payment"
          )}
        </button>
      </div>
    </form>
  );
}
