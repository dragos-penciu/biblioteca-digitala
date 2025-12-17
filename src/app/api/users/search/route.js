import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  await connectDB();

  const users = await User.find({
    username: { $regex: `^${q}`, $options: "i" }
  })
    .limit(5)
    .select("username")
    .lean();

  return NextResponse.json({ users });
}
