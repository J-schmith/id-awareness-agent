"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4">
      <div
        className="w-full max-w-md rounded-2xl border border-white/30 p-8 shadow-lg"
        style={{
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Logo / title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0071e3] to-[#34c759] text-white text-lg font-bold shadow-md">
            I&D
          </div>
          <h1 className="text-xl font-semibold text-[#1d1d1f]">
            Sign in to I&D Agent
          </h1>
          <p className="mt-1 text-sm text-[#86868b]">
            Inclusion &amp; Diversity Awareness Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#6e6e73]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-[#d2d2d7] bg-white/80 px-3.5 py-2.5 text-sm text-[#1d1d1f] placeholder-[#aeaeb2] outline-none transition-shadow focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[#6e6e73]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-[#d2d2d7] bg-white/80 px-3.5 py-2.5 text-sm text-[#1d1d1f] placeholder-[#aeaeb2] outline-none transition-shadow focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0071e3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0077ed] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Dev hint */}
        <p className="mt-6 text-center text-xs text-[#aeaeb2]">
          Dev credentials: admin@company.com / admin123
        </p>
      </div>
    </div>
  );
}
