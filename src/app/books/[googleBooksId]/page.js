import Image from "next/image";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";
import BookReviewCard from "@/components/BookReviewCard";
import WriteReviewBox from "@/components/WriteReviewBox";

export const runtime = "nodejs";

function bestCover(info) {
  const img =
    info?.imageLinks?.extraLarge ||
    info?.imageLinks?.large ||
    info?.imageLinks?.medium ||
    info?.imageLinks?.small ||
    info?.imageLinks?.thumbnail ||
    info?.imageLinks?.smallThumbnail ||
    "";

  if (!img) return "";

  let url = img.replace(/^http:\/\//i, "https://");
  if (url.includes("books.google.com/books/content")) {
    url = url.includes("zoom=")
      ? url.replace(/zoom=\d+/i, "zoom=5")
      : `${url}${url.includes("?") ? "&" : "?"}zoom=5`;
  }
  return url;
}

function stripHtml(s) {
  return String(s || "").replace(/<[^>]*>/g, "").trim();
}

async function fetchBook(googleBooksId) {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const base = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleBooksId)}`;
  const url = key ? `${base}?key=${encodeURIComponent(key)}` : base;

  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) return null;

  const data = await res.json();
  const info = data.volumeInfo || {};

  return {
    googleBooksId: data.id,
    title: info.title || "Untitled",
    subtitle: info.subtitle || "",
    authors: info.authors || [],
    description: stripHtml(info.description || ""),
    publishedDate: info.publishedDate || "",
    pageCount: info.pageCount || null,
    categories: info.categories || [],
    publisher: info.publisher || "",
    language: info.language || "",
    coverImage: bestCover(info),
  };
}

async function getBookReviews(googleBooksId) {
  await connectDB();

  const [result] = await Review.aggregate([
    { $match: { googleBooksId } },
    {
      $facet: {
        reviews: [
          { $sort: { rating: -1, createdAt: -1 } },
          { $limit: 200 },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 1,
              googleBooksId: 1,
              rating: 1,
              text: 1,
              createdAt: 1,
              username: { $ifNull: ["$user.username", "unknown"] },
            },
          },
        ],
        stats: [
          {
            $group: {
              _id: null,
              reviewCount: { $sum: 1 },
              avgRating: { $avg: "$rating" },
            },
          },
        ],
      },
    },
  ]);

  const stats = (result?.stats && result.stats[0]) || { reviewCount: 0, avgRating: null };
  const avgRounded = stats.avgRating != null ? Math.round(stats.avgRating * 100) / 100 : null;


  return {
    reviews: result?.reviews || [],
    reviewCount: stats.reviewCount || 0,
    avgRating: avgRounded,
  };
}

export default async function BookPage({ params }) {
  const { googleBooksId } = await params;

  const book = await fetchBook(googleBooksId);
  if (!book) return notFound();

  const { reviews, reviewCount, avgRating } = await getBookReviews(googleBooksId);

  return (
    <main className="min-h-screen bg-bg text-primary px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="flex flex-col sm:flex-row gap-6">
          <div className="shrink-0">
            <div className="relative h-56 w-40 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  sizes="160px"
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {book.title}
            </h1>

            {book.subtitle ? (
              <div className="mt-1 text-muted">{book.subtitle}</div>
            ) : null}

            {book.authors.length ? (
              <div className="mt-3 text-sm text-primary/90">
                <span className="text-muted">By </span>
                {book.authors.join(", ")}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <div className="rounded-full bg-surface border border-border px-3 py-1">
                <span className="font-semibold">★</span>{" "}
                {avgRating ?? "—"}{" "}
                <span className="text-muted">({reviewCount} review{reviewCount === 1 ? "" : "s"})</span>
              </div>

              {book.publishedDate ? (
                <div className="rounded-full bg-surface border border-border px-3 py-1 text-muted">
                  {book.publishedDate}
                </div>
              ) : null}

              {book.pageCount ? (
                <div className="rounded-full bg-surface border border-border px-3 py-1 text-muted">
                  {book.pageCount} pages
                </div>
              ) : null}

              {book.publisher ? (
                <div className="rounded-full bg-surface border border-border px-3 py-1 text-muted">
                  {book.publisher}
                </div>
              ) : null}
            </div>

            {book.description ? (
              <p className="mt-6 text-sm leading-relaxed text-primary/90">
                {book.description}
              </p>
            ) : (
              <p className="mt-6 text-sm text-muted">
                No description available.
              </p>
            )}

            {book.categories.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {book.categories.slice(0, 6).map((c) => (
                  <span
                    key={c}
                    className="text-xs rounded-full border border-border bg-surface px-3 py-1 text-muted"
                  >
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">
            Reviews
          </h2>

          <div className="mt-4">
            <WriteReviewBox googleBooksId={googleBooksId} />
          </div>

          <div className="mt-4 space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface p-6 text-muted">
                No one has reviewed this book yet.
              </div>
            ) : (
              reviews.map((r) => <BookReviewCard key={String(r._id)} review={r} />)
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
