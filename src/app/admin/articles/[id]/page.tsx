import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ArticleEditor from "@/components/ArticleEditor";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = db
    .select()
    .from(schema.articles)
    .where(eq(schema.articles.id, parseInt(id)))
    .get();

  if (!article) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Article</h1>
      <ArticleEditor
        article={{
          id: article.id,
          title: article.title,
          excerpt: article.excerpt || "",
          content: article.content,
          coverImage: article.coverImage || "",
          categoryId: article.categoryId,
          status: article.status,
        }}
      />
    </div>
  );
}
