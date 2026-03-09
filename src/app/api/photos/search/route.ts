import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const page = searchParams.get("page") || "1";

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "Unsplash API is not configured" },
      { status: 500 }
    );
  }

  const unsplashUrl = new URL("https://api.unsplash.com/search/photos");
  unsplashUrl.searchParams.set("query", query);
  unsplashUrl.searchParams.set("page", page);
  unsplashUrl.searchParams.set("per_page", "12");

  const res = await fetch(unsplashUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Unsplash API error:", res.status, text);
    return NextResponse.json(
      { error: "Failed to search photos" },
      { status: res.status }
    );
  }

  const data = await res.json();

  const photos = data.results.map(
    (photo: {
      id: string;
      urls: { small: string; regular: string };
      alt_description: string | null;
      user: { name: string; links: { html: string } };
    }) => ({
      id: photo.id,
      thumbnail: photo.urls.small,
      fullUrl: photo.urls.regular,
      alt: photo.alt_description || "",
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
    })
  );

  return NextResponse.json({
    photos,
    totalPages: data.total_pages,
    total: data.total,
  });
}
