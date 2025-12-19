import { notFound } from "next/navigation";
import ReviewCard from "@/components/ReviewCard";
import { headers } from "next/headers";

const bookCache = new Map();

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

async function fetchBook(googleBooksId) {
  if (bookCache.has(googleBooksId)) return bookCache.get(googleBooksId);

  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const base = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleBooksId)}`;
  const url = key ? `${base}?key=${encodeURIComponent(key)}` : base;

  const res = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!res.ok) return null;

  const data = await res.json();
  const info = data.volumeInfo || {};

  const book = {
    googleBooksId: data.id,
    title: info.title || "Untitled",
    authors: info.authors || [],
    coverImage: bestCover(info),
  };

  bookCache.set(googleBooksId, book);
  return book;
}

async function getUserReviews(username) {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const url = `${origin}/api/users/${encodeURIComponent(username)}/reviews`;

  const res = await fetch(url, { cache: "no-store" });

  const text = await res.text().catch(() => "");
  console.log("getUserReviews:", { url, status: res.status, ok: res.ok, body: text.slice(0, 400) });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load user reviews (status ${res.status})`);

  return JSON.parse(text);
}


export default async function UserProfilePage({ params }) {
  const { username } = await params;
  const data = await getUserReviews(username);
  if (!data) return notFound();

  const reviews = data.reviews || [];

  const limitedReviews = reviews.slice(0, 50);

  const items = await Promise.all(
    limitedReviews.map(async (r) => ({
      review: r,
      book: await fetchBook(r.googleBooksId),
    }))
  );

  return (
    <main className="min-h-screen bg-bg text-primary px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              @{data.username}
            </h1>
            <p className="mt-2 select-none text-muted text-sm">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
              {reviews.length > 50 ? " (showing top 50)" : ""}
            </p>
          </div>
        </header>

        <section className="mt-8">
          <h2 className="text-lg font-semibold select-none tracking-tight">Reviews</h2>

          <div className="mt-4 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface p-6 text-muted">
                No reviews yet.
              </div>
            ) : (
              items.map(({ book, review }) => (
                <ReviewCard
                  key={`${review.googleBooksId}-${review.createdAt}`}
                  book={book}
                  review={review}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
