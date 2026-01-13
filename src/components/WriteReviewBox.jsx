"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WriteReviewBox({ googleBooksId }) {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="rounded-2xl border border-border bg-surface p-4" />;
  }

  if (!token) return null;

  async function submit() {
    if (!text.trim()) {
      setError("Please write a review.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ googleBooksId, rating, text }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Failed to submit review.");
        return;
      }

      setText("");
      setRating(5);
      setOpen(false);

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl select-none border border-border bg-surface p-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-sm cursor-pointer font-medium text-primary hover:underline"
        >
          Write a review
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="rounded-lg cursor-pointer border border-border bg-surface px-2 py-1 text-sm"
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
            placeholder="What did you think?"
            className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-accent/60"
          />

          {error && <div className="text-sm text-red-400">{error}</div>}

          <div className="flex items-center gap-3">
            <button
              onClick={submit}
              disabled={loading}
              className="rounded-xl bg-primary cursor-pointer px-4 py-2 text-sm font-semibold text-surface hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Posting…" : "Post review"}
            </button>

            <button
              onClick={() => setOpen(false)}
              className="text-sm cursor-pointer text-muted hover:text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
