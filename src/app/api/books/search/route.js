import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });

  const key = process.env.GOOGLE_BOOKS_API_KEY;
  const url =
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10` +
    (key ? `&key=${encodeURIComponent(key)}` : "");

  try {
    const res = await fetch(url);

    // 🔎 TEMP DEBUG
    const text = await res.text();
    console.log("Google Books status:", res.status);
    console.log("Google Books response:", text.slice(0, 500));

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Google Books", status: res.status, details: text },
        { status: 502 }
      );
    }

    const data = JSON.parse(text);

    const items = (data.items || []).map((item) => {
      const info = item.volumeInfo || {};
      return {
        googleBooksId: item.id,
        title: info.title || "Untitled",
        authors: info.authors || [],
        coverImage: info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "",
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.log("Fetch threw error:", err);
    return NextResponse.json({ error: "Fetch error", details: String(err) }, { status: 502 });
  }
}
