import Link from "next/link";

export default function BookReviewCard({ review }) {
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

        <div className="shrink-0 rounded-full bg-bg px-3 py-1 text-xs font-semibold text-primary">
          ★ {review.rating}
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-primary/90">
        {review.text}
      </p>
    </div>
  );
}
