import { NextResponse } from "next/server";

export async function GET() {
  console.log("✅ PING HIT");
  return NextResponse.json({ ok: true });
}
