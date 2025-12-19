import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import User from "@/models/User";

export const runtime = "nodejs";

async function fetchBook(googleBooksId) {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const base = `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleBooksId)}`;
  const url = key ? `${base}?key=${encodeURIComponent(key)}` : base;

  const res = await fetch(url);

  if (!res.ok) {
    return { ok: false, status: res.status };
  }

  const data = await res.json();
  const info = data.volumeInfo || {};

  return {
    ok: true,
    book: {
      googleBooksId: data.id,
      title: info.title || "Untitled",
      authors: info.authors || [],
      description: info.description || "",
      coverImage:
        info.imageLinks?.thumbnail ||
        info.imageLinks?.smallThumbnail ||
        "",
      publishedDate: info.publishedDate || "",
      pageCount: info.pageCount || null,
      categories: info.categories || []
    }
  };
}

export async function GET(req, ctx) {
  const {googleBooksId} = await ctx.params;

  if (!googleBooksId) {
    return NextResponse.json({error: "Missing googleBooksId"}, {status: 400});
  }

  const gb = await fetchBook(googleBooksId);
  if (!gb.ok) {
    return NextResponse.json({error: "Book not found on Google Books", status: gb.status}, {status: 404});
  }

  await connectDB();

  const reviews = await Review.find({googleBooksId})
    .populate("userId", "username")
    .sort({ createdAt: -1 })
    .lean();

  const avgRating = reviews.length === 0 ? null : reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length;


  return NextResponse.json({
    book: gb.book,
    reviews,
    avgRating,
    reviewCount: reviews.length
  });
}
