import Link from "next/link";
import Image from "next/image";

export default function BookCard({ book }) {
  const { googleBooksId, title, authors, coverImage, reviewCount, avgRating } = book;

  return (
    <Link
      href={`/books/${googleBooksId}`}
      className="
        group block rounded-2xl border border-border bg-surface
        shadow-sm hover:shadow-md transition
        overflow-hidden
      "
    >
      <div className="relative w-full aspect-[2/3] bg-bg">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
            className="object-cover group-hover:scale-[1.02] transition"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">
            No cover
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="text-sm font-semibold tracking-tight text-primary line-clamp-2">
          {title}
        </div>

        <div className="mt-1 text-xs text-muted line-clamp-1">
          {(authors || []).join(", ")}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted">
            {reviewCount ?? 0} review{reviewCount === 1 ? "" : "s"}
          </span>

          {avgRating != null ? (
            <span className="text-primary font-medium">
              ★ {avgRating}
            </span>
          ) : (
            <span className="text-muted">—</span>
          )}
        </div>
      </div>
    </Link>
  );
}
