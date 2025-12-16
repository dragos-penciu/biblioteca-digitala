import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Review from "@/models/Review";

async function fetchBook(googleBooksId) {
  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const url =
    `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(googleBooksId)}` +
    (key ? `?key=${encodeURIComponent(key)}` : "");

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const info = data.volumeInfo || {};

  return {
    googleBooksId: data.id,
    title: info.title || "Untitled",
    authors: info.authors || [],
    coverImage: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || ""
  };
}

export async function GET(req, ctx) {
  const {username} = await ctx.params;
  const usernameParam = String(username || "").trim().toLowerCase();
  if (!usernameParam) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({username: usernameParam});
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const reviews = await Review.find({userId: user._id})
    .sort({ rating: -1, createdAt: -1 })
    .lean();

  const uniqueIds = [...new Set(reviews.map(r => r.googleBooksId))];

  const booksArray = await Promise.all(uniqueIds.map(fetchBook));
  const bookMap = new Map(booksArray.filter(Boolean).map(b => [b.googleBooksId, b]));

  const hydrated = reviews.map(r => ({
    ...r,
    book: bookMap.get(r.googleBooksId) || null
  }));

  return NextResponse.json({
    user: { username: user.username },
    reviews: hydrated
  });
}
