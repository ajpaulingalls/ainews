import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const articleId = parseInt(id);

  const article = db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      content: schema.articles.content,
      coverImage: schema.articles.coverImage,
      coverImageAttribution: schema.articles.coverImageAttribution,
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
    .where(eq(schema.articles.id, articleId))
    .get();

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const articleId = parseInt(id);
  const body = await request.json();

  const existing = db
    .select()
    .from(schema.articles)
    .where(eq(schema.articles.id, articleId))
    .get();

  if (!existing) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
  if (body.content !== undefined) updates.content = body.content;
  if (body.coverImage !== undefined) updates.coverImage = body.coverImage;
  if (body.coverImageAttribution !== undefined) updates.coverImageAttribution = body.coverImageAttribution;
  if (body.categoryId !== undefined) updates.categoryId = body.categoryId;
  if (body.status !== undefined) {
    updates.status = body.status;
    if (body.status === "published" && existing.status !== "published") {
      updates.publishedAt = new Date();
    }
  }

  const article = db
    .update(schema.articles)
    .set(updates)
    .where(eq(schema.articles.id, articleId))
    .returning()
    .get();

  return NextResponse.json(article);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const articleId = parseInt(id);

  db.delete(schema.articles).where(eq(schema.articles.id, articleId)).run();
  return NextResponse.json({ ok: true });
}
