"use client";

import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Something went wrong");
      } else {
        setMessage(
          data?.data?.message ||
            "If an account exists, a reset link has been sent.",
        );
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-sky-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.25)] sm:p-10">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                Password help
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Forgot your password?
              </h1>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-600">
            Enter your account email and we&apos;ll send a link to reset your
            password.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 grid gap-4 sm:grid-cols-1"
          >
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6">
              <label className="block text-sm font-semibold text-slate-900">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                placeholder="you@example.com"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}

            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Create a new account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
