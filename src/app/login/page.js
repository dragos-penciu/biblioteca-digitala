"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const id = identifier.trim();
    if (!id || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Login failed.");
        return;
      }

      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.username) localStorage.setItem("username", data.username);

      window.location.href="/";
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg text-primary px-6 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
        <p className="mt-2 text-muted">
          Welcome back to booklog.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 select-none rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm select-none font-medium text-primary">
              Email or username
            </label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-accent/60"
              placeholder="name@domain.com"
              autoComplete="username"
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
              autoComplete="current-password"
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
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
