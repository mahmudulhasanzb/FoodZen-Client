"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // Default to admin for convenient setup
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Sign up the user via Better Auth
      const { data, error: authError } = await signUp.email({
        email,
        password,
        name,
      });

      if (authError) {
        setError(authError.message || "Failed to sign up");
        setLoading(false);
        return;
      }

      if (!data?.user?.id) {
        setError("Sign up succeeded but user ID is missing.");
        setLoading(false);
        return;
      }

      // 2. Create the associated staff record on Express backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/staff/register-public`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: data.user.id,
            name: data.user.name,
            role,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to link staff record");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Something went wrong during registration");
      setLoading(false);
    }
  }

  const ROLES = ["admin", "manager", "server", "kitchen"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
        <div className="card-body gap-6">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary tracking-tight">
              FoodZen
            </h1>
            <p className="text-sm opacity-60 mt-1">Staff Self-Registration</p>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success text-sm flex items-center gap-2">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Registration successful! Redirecting to login...</span>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error text-sm flex items-center gap-2">
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
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label" htmlFor="register-name">
                <span className="label-text font-medium">Name *</span>
              </label>
              <input
                id="register-name"
                type="text"
                placeholder="John Doe"
                className="input input-bordered w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="register-email">
                <span className="label-text font-medium">Email *</span>
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="john.doe@foodzen.com"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading || success}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="register-password">
                <span className="label-text font-medium">Password *</span>
              </label>
              <input
                id="register-password"
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
                disabled={loading || success}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="register-role">
                <span className="label-text font-medium">Select Role *</span>
              </label>
              <select
                id="register-role"
                className="select select-bordered w-full capitalize cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                disabled={loading || success}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full mt-2 ${loading || success ? "btn-disabled" : ""}`}
              disabled={loading || success}
            >
              {loading && <span className="loading loading-spinner loading-sm" />}
              {loading ? "Registering…" : "Register & Sign Up"}
            </button>
          </form>

          <div className="text-sm text-center">
            <span className="opacity-70">Already have an account? </span>
            <Link href="/login" className="link link-primary font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
