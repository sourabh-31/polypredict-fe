import { NextResponse } from "next/server";

// The API was written in server to get rid of CORS issues. Since the API route is in the same domain as the frontend, it can fetch data from the external API without any CORS issues.
export async function GET() {
  const res = await fetch(
    "https://gamma-api.polymarket.com/events?tag_id=2&active=true&closed=false&limit=5&offset=5&order=volume&ascending=false",
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }

  const data = await res.json();

  return NextResponse.json(data);
}
