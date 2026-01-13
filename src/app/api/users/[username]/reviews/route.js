export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Review from "@/models/Review";

function getUsernameFromPath(req) {
  const pathname = new URL(req.url).pathname;
  const m = pathname.match(/^\/api\/users\/([^/]+)\/reviews\/?$/);
  return m ? decodeURIComponent(m[1]) : "";
}

export async function GET(req) {
  const cleanUsername = String(getUsernameFromPath(req) || "")
    .trim()
    .toLowerCase();

  if (!cleanUsername) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({ username: cleanUsername })
    .select("_id username")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const reviews = await Review.find({ userId: user._id })
    .sort({ rating: -1, createdAt: -1 })
    .select("googleBooksId rating text createdAt")
    .lean();

  return NextResponse.json({ username: user.username, reviews: reviews || [] });
}
