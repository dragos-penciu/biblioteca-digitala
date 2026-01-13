"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function parseJwtPayload(token) {
  const part = token?.split(".")?.[1];
  if (!part) return null;

  const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  try {
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function BookReviewCard({ review }) {
  const router = useRouter();

  const [token, setToken] = useState(null);
  const [meUserId, setMeUserId] = useState(null);

  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(Number(review.rating) || 5);
  const [text, setText] = useState(review.text || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);

    const payload = parseJwtPayload(t);
    setMeUserId(payload?.userId ? String(payload.userId) : null);
  }, []);

  const isMine = useMemo(() => {
    if (!meUserId) return false;
    return String(review.userId || "") === meUserId;
  }, [meUserId, review.userId]);

  async function save() {
    setErr("");
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      setErr("Rating must be between 1 and 5.");
      return;
    }
    if (!text.trim()) {
      setErr("Review text cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/reviews/${review._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: r, text: text.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Failed to save changes.");
        return;
      }

      setEditing(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function del() {
    if (!confirm("Delete this review?")) return;

    setErr("");
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews/${review._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Failed to delete review.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/users/${review.username}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            @{review.username}
          </Link>
          {review.createdAt ? (
            <div className="mt-0.5 text-xs text-muted">
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {isMine && !editing ? (
            <button
              type="button"
              onClick={() => {
                setRating(Number(review.rating) || 5);
                setText(review.text || "");
                setErr("");
                setEditing(true);
              }}
              className="text-xs cursor-pointer text-muted hover:text-primary transition"
            >
              Edit
            </button>
          ) : null}
          <div className="shrink-0 rounded-full bg-bg px-3 py-1 text-xs font-semibold text-primary">
            ★ {Number(review.rating).toFixed(1).replace(/\.0$/, "")}
          </div>

        </div>
      </div>

      {!editing ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-primary/90">
          {review.text}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rounded-lg cursor-pointer border border-border bg-surface px-2 py-1 text-sm"
              disabled={loading}
            >
              {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-accent/60"
            disabled={loading}
          />

          {err ? <div className="text-sm text-red-400">{err}</div> : null}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={loading}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-surface cursor-pointer hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setErr("");
              }}
              disabled={loading}
              className="text-sm cursor-pointer text-muted hover:text-primary"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={del}
              disabled={loading}
              className="ml-auto text-sm cursor-pointer text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
