import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { isValidEmail, isValidUsername } from "@/lib/validators";

export async function POST(req) {
  const {email, username, password} = await req.json();

  const normalizedEmail = String(email || "").trim().toLowerCase();

  
  if (!normalizedEmail || !username || !password) {
    return NextResponse.json({error: "Missing fields"}, {status: 400});
  }
  
  if (!isValidEmail(normalizedEmail)) {
    return NextResponse.json({error: "Invalid email format" }, {status: 400});
  }
  
  if (!isValidUsername(username)) {
    return NextResponse.json({error: "Invalid username format" }, {status: 400});
  }

  if (password.length < 8) {
    return NextResponse.json({error: "Password must be at least 8 characters" }, {status: 400});
}

  await connectDB();

  const existingEmail = await User.findOne({email: normalizedEmail});
  if (existingEmail) {
    return NextResponse.json({error: "A user with this email already exists"}, {status: 409});
  }

  const existingUsername = await User.findOne({username: username});
  if (existingUsername) {
    return NextResponse.json({error: "A user with this username already exists"}, {status: 409});
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({email: normalizedEmail, username, passwordHash});

  return NextResponse.json({message: "User created successfully"}, {status: 201});
}
