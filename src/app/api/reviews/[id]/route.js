export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import { verifyToken } from "@/lib/auth";

function getIdFromPath(req) {
  const pathname = new URL(req.url).pathname; // /api/reviews/<id>
  const m = pathname.match(/^\/api\/reviews\/([^/]+)\/?$/);
  return m ? decodeURIComponent(m[1]) : "";
}

function getBearerToken(req) {
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export async function PUT(req) {
  const id = getIdFromPath(req);
  if (!id) return NextResponse.json({ error: "Missing review id" }, { status: 400 });

  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
  } catch (e) {
    return NextResponse.json({ error: "Invalid token", details: e?.message }, { status: 401 });
  }

  const { rating, text } = await req.json().catch(() => ({}));

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Review text is required" }, { status: 400 });
  }

  const numRating = Number(rating);
  if (!Number.isFinite(numRating) || numRating < 1 || numRating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  await connectDB();

  const review = await Review.findById(id);
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  if (String(review.userId) !== String(payload.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  review.rating = numRating;
  review.text = text.trim();
  await review.save();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const id = getIdFromPath(req);
  if (!id) return NextResponse.json({ error: "Missing review id" }, { status: 400 });

  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 401 });

  let payload;
  try {
    payload = verifyToken(token);
  } catch (e) {
    return NextResponse.json({ error: "Invalid token", details: e?.message }, { status: 401 });
  }

  await connectDB();

  const review = await Review.findById(id);
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  if (String(review.userId) !== String(payload.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Review.deleteOne({ _id: id });

  return NextResponse.json({ ok: true });
}
