import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { photoUrl, photographer, photographerUrl } = body;

  if (!photoUrl || !photographer || !photographerUrl) {
    return NextResponse.json(
      { error: "photoUrl, photographer, and photographerUrl are required" },
      { status: 400 }
    );
  }

  // Validate URL is from Unsplash
  try {
    const url = new URL(photoUrl);
    if (!url.hostname.endsWith("unsplash.com")) {
      return NextResponse.json(
        { error: "Only Unsplash URLs are allowed" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const res = await fetch(photoUrl);
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to download photo" },
      { status: 502 }
    );
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });

  const bytes = new Uint8Array(await res.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  const attribution = JSON.stringify({ photographer, photographerUrl });

  return NextResponse.json(
    { url: `/uploads/${filename}`, attribution },
    { status: 201 }
  );
}
