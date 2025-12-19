import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";

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
    if (url.includes("zoom=")) url = url.replace(/zoom=\d+/i, "zoom=5");
    else url += (url.includes("?") ? "&" : "?") + "zoom=5";
  }

  return url;
}

async function fetchBook(googleBooksId) {
  if (bookCache.has(googleBooksId)) return bookCache.get(googleBooksId);

  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const base = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleBooksId)}`;
  const url = key ? `${base}?key=${encodeURIComponent(key)}` : base;

  const res = await fetch(url);
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

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 24);

  await connectDB();

  const agg = await Review.aggregate([
    {
      $group: {
        _id: "$googleBooksId",
        reviewCount: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    { $sort: { reviewCount: -1 } },
    { $limit: limit },
  ]);

  const books = await Promise.all(
    agg.map(async (row) => {
      const book = await fetchBook(row._id);
      if (!book) return null;
      return {
        ...book,
        reviewCount: row.reviewCount,
        avgRating: row.avgRating ? row.avgRating.toFixed(2) : null,
      };
    })
  );

  const items = books
    .filter(Boolean)
    .sort((a, b) => {
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
      return a.title.localeCompare(b.title);
    });

  return NextResponse.json({ items });
}
