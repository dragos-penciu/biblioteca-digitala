import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/validators";

export async function POST(req) {
  const {identifier, password} = await req.json();

  if (!identifier || !password) {
    return NextResponse.json({error: "Missing fields"}, {status: 400});
  }

  const trimmed = String(identifier).trim();

  await connectDB();

  let user;

  if (isValidEmail(trimmed)) {
    const email = trimmed.toLowerCase();
    user = await User.findOne({email});
  } else {
    const username = trimmed.toLowerCase();
    user = await User.findOne({username});
  }

  if (!user) {
    return NextResponse.json({error: "Invalid email/username or password"}, {status: 401});
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({error: "Invalid email/username or password."}, {status: 401});
  }

  const token = signToken({userId: user._id,});

  return NextResponse.json({ token, username: user.username });
}
