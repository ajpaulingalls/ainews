import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const categoryId = searchParams.get("categoryId");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      coverImage: schema.articles.coverImage,
      status: schema.articles.status,
      categoryId: schema.articles.categoryId,
      authorId: schema.articles.authorId,
      publishedAt: schema.articles.publishedAt,
      createdAt: schema.articles.createdAt,
      updatedAt: schema.articles.updatedAt,
      categoryName: schema.categories.name,
      categorySlug: schema.categories.slug,
      authorName: schema.users.name,
    })
    .from(schema.articles)
    .leftJoin(schema.categories, eq(schema.articles.categoryId, schema.categories.id))
    .leftJoin(schema.users, eq(schema.articles.authorId, schema.users.id))
    .orderBy(desc(schema.articles.createdAt))
    .limit(limit);

  const conditions = [];
  if (status) {
    conditions.push(eq(schema.articles.status, status as "draft" | "published" | "archived"));
  }
  if (categoryId) {
    conditions.push(eq(schema.articles.categoryId, parseInt(categoryId)));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  const articles = query.all();
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, excerpt, content, coverImage, categoryId, status } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const slug = slugify(title) + "-" + Date.now().toString(36);
  const now = new Date();

  const article = db
    .insert(schema.articles)
    .values({
      title,
      slug,
      excerpt: excerpt || null,
      content,
      coverImage: coverImage || null,
      status: status || "draft",
      categoryId: categoryId || null,
      authorId: user.id,
      publishedAt: status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  return NextResponse.json(article, { status: 201 });
}
