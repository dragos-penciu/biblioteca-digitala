import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import { getAuthPayload } from "@/lib/requireAuth";
import User from "@/models/User";

export const runtime = "nodejs";


export async function POST(req) {
  const payload = getAuthPayload(req);
  if (!payload) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const {googleBooksId, rating, text} = await req.json();

  if (!googleBooksId || !rating) {
    return NextResponse.json({error: "Missing fields"}, {status: 400});
  }

  if (rating < 1 || rating > 5 || !Number.isInteger(rating * 2)) {
    return NextResponse.json({error: "Rating must be between 1 and 5 in 0.5 increments"}, {status: 400});
  }

  await connectDB();

  try {
    const review = await Review.create({
      userId: payload.userId,
      googleBooksId,
      rating,
      text: text || ""
    });

    return NextResponse.json({review}, {status: 201});
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({error: "You have already reviewed this book"}, {status: 409});
    }

    return NextResponse.json({error: "Failed to create review"}, {status: 500});
  }
}

export async function GET(req) {
  const {searchParams} = new URL(req.url);
  const googleBooksId = searchParams.get("googleBooksId");

  if (!googleBooksId) {
    return NextResponse.json({error: "Missing googleBooksId"}, {status: 400});
  }

  await connectDB();

  const reviews = await Review.find({googleBooksId})
    .populate("userId", "username")
    .sort({ createdAt: -1 });

  return NextResponse.json({reviews});
}
