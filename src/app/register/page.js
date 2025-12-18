"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const u = username.trim();
    const eMail = email.trim().toLowerCase();

    if (!u || !eMail || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: u,
          email: eMail,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Registration failed.");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg text-primary px-6 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Sign up</h1>
        <p className="mt-2 text-muted">
          Create your booklog account.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 select-none rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm select-none font-medium text-primary">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-accent/60"
              placeholder="bookloguser123"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm select-none font-medium text-primary">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-accent/60"
              placeholder="name@domain.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm select-none font-medium text-primary">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-accent/60"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full rounded-xl bg-primary text-bg
              py-3 font-semibold
              hover:opacity-90 transition
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
