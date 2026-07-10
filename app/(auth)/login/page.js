"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { validateLoginForm } from "@/lib/login-validation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const emailRef = useRef(null);

  useEffect(() => {
    if (fieldErrors.email && emailRef.current) {
      emailRef.current.focus();
    }
  }, [fieldErrors.email]);

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const result = validateLoginForm({ email, password });
    setFieldErrors((prev) => ({ ...prev, [field]: result.errors[field] }));
  }

  function validateAll() {
    const result = validateLoginForm({ email, password });
    setFieldErrors(result.errors);
    setTouched({ email: true, password: true });
    return result.isValid;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!validateAll()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await signIn.email({
        email: email.trim(),
        password,
        rememberMe,
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="card w-full max-w-sm bg-slate-800 shadow-2xl border border-slate-700">
        <div className="card-body gap-6">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-orange-500 tracking-tight uppercase">
              FoodZen
            </h1>
            <p className="text-sm text-slate-400 mt-1 tracking-wide">Staff Portal</p>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" aria-live="assertive" className="alert text-sm bg-red-500/10 border border-red-500 text-red-400">
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
                <span className="label-text font-medium text-slate-200">Email</span>
              </label>
              <input
                ref={emailRef}
                id="login-email"
                type="email"
                placeholder="staff@foodzen.com"
                className={`input input-bordered w-full bg-slate-900 text-slate-200 ${touched.email && fieldErrors.email ? "border-red-500 ring-1 ring-red-500/50" : "border-slate-600"}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                required
                autoComplete="email"
                disabled={loading}
                aria-invalid={touched.email ? !!fieldErrors.email : undefined}
                aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
              />
              {touched.email && fieldErrors.email && (
                <label id="login-email-error" className="label py-1">
                  <span className="label-text-alt text-red-400">{fieldErrors.email}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label" htmlFor="login-password">
                <span className="label-text font-medium text-slate-200">Password</span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pr-10 bg-slate-900 text-slate-200 ${touched.password && fieldErrors.password ? "border-red-500 ring-1 ring-red-500/50" : "border-slate-600"}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  required
                  autoComplete="current-password"
                  minLength={6}
                  disabled={loading}
                  aria-invalid={touched.password ? !!fieldErrors.password : undefined}
                  aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-orange-500 transition-opacity"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.292-4.292M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.064 7-9.543 7-4.478 0-8.268-2.943-9.543-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <label id="login-password-error" className="label py-1">
                  <span className="label-text-alt text-red-400">{fieldErrors.password}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="label-text text-slate-300">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className={`btn w-full mt-2 bg-orange-500 hover:bg-amber-400 text-white font-bold uppercase tracking-widest text-lg transition-all duration-200 ${loading ? "btn-disabled" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  <span>Signing in…</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-sm text-center">
            <span className="text-slate-400">New staff? </span>
            <Link href="/signup" className="text-orange-400 font-medium hover:underline">
              Create an account
            </Link>
          </div>

          <p className="text-xs text-center text-slate-500">
            Contact your admin for account access.
          </p>
        </div>
      </div>
    </div>
  );
}
