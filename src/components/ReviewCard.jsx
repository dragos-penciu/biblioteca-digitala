"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ReviewCard({ book, review }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const bookHref = `/books/${review.googleBooksId}`;

  return (
    <>
      <div
        suppressHydrationWarning
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true);
        }}
        className="
          group flex gap-4 cursor-pointer select-none w-full
          rounded-2xl border border-border bg-surface p-4
          shadow-sm hover:shadow-md transition
        "
      >
        <Link
          href={bookHref}
          onClick={(e) => e.stopPropagation()}
          className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-bg"
          aria-label={`Open ${book?.title || "book"} page`}
        >
          {book?.coverImage ? (
            <Image
              src={book.coverImage}
              alt={book.title || "Book cover"}
              fill
              sizes="64px"
              className="object-cover group-hover:scale-[1.02] transition"
            />
          ) : null}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <Link
                href={bookHref}
                onClick={(e) => e.stopPropagation()}
                className="block truncate text-sm font-semibold text-primary hover:underline"
                title={book?.title || "Untitled"}
              >
                {book?.title || "Untitled"}
              </Link>

              {book?.authors?.length ? (
                <div className="mt-0.5 truncate text-xs text-muted">
                  {book.authors.join(", ")}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 rounded-full bg-bg px-3 py-1 text-xs font-semibold text-primary">
              ★ {review.rating}
            </div>
          </div>

          <p className="mt-3 text-sm text-primary/90 line-clamp-3">
            {review.text}
          </p>
        </div>
      </div>

      {open && (
        <div className="fixed select-none inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Close review"
          />

          <div className="relative mx-auto mt-24 w-[min(720px,92vw)] rounded-2xl border border-border bg-surface shadow-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={bookHref}
                    onClick={(e) => e.stopPropagation()}
                    className="text-lg font-semibold tracking-tight text-primary hover:underline"
                  >
                    {book?.title || "Untitled"}
                  </Link>
                  <span className="shrink-0 rounded-full bg-bg px-3 py-1 text-xs font-semibold text-primary">
                    ★ {review.rating}
                  </span>
                </div>

                {book?.authors?.length ? (
                  <div className="mt-1 text-sm text-muted">
                    {book.authors.join(", ")}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-muted cursor-pointer hover:text-primary transition"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex gap-4">
              <Link
                href={bookHref}
                onClick={(e) => e.stopPropagation()}
                className="relative hidden sm:block h-36 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-bg"
                aria-label="Open book page"
              >
                {book?.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title || "Book cover"}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : null}
              </Link>

              <div className="min-w-0">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary/90">
                  {review.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
