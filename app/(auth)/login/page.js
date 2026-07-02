"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await signIn.email({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl border border-base-300">
        <div className="card-body gap-6">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              FoodZen
            </h1>
            <p className="text-sm opacity-60 mt-1">Staff Portal</p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label" htmlFor="login-email">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="staff@foodzen.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="login-password">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                minLength={6}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full mt-2 ${loading ? "btn-disabled" : ""}`}
              disabled={loading}
            >
              {loading && <span className="loading loading-spinner loading-sm" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="text-sm text-center">
            <span className="opacity-70">New staff member? </span>
            <Link href="/signup" className="link link-primary font-medium">
              Create an account
            </Link>
          </div>

          <p className="text-xs text-center opacity-50">
            Contact your admin for account access.
          </p>
        </div>
      </div>
    </div>
  );
}
