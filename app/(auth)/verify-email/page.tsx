"use client";

import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Verification failed");
      } else {
        router.push("/feed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to resend OTP");
      } else {
        setError(null);
        setOtp("");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setResending(false);
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
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-green-100 text-green-700">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-600">
                Email verification
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Verify your email
              </h1>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-slate-600">
            We&apos;ve sent a 6-digit code to <span className="font-semibold">{email}</span>. Enter it below to verify your email and complete registration.
          </p>

          <form onSubmit={handleVerify} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                placeholder="000000"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-center text-2xl tracking-widest font-semibold"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-sky-600 hover:underline disabled:opacity-50"
            >
              {resending ? "Resending..." : "Didn't receive the code? Resend"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
