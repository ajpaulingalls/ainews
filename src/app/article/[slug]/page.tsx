import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      content: schema.articles.content,
      coverImage: schema.articles.coverImage,
      coverImageAttribution: schema.articles.coverImageAttribution,
      publishedAt: schema.articles.publishedAt,
      categoryName: schema.categories.name,
      categorySlug: schema.categories.slug,
      authorName: schema.users.name,
    })
    .from(schema.articles)
    .leftJoin(schema.categories, eq(schema.articles.categoryId, schema.categories.id))
    .leftJoin(schema.users, eq(schema.articles.authorId, schema.users.id))
    .where(
      and(
        eq(schema.articles.slug, slug),
        eq(schema.articles.status, "published")
      )
    )
    .get();

  if (!article) {
    notFound();
  }

  // Parse attribution if present
  let photoAttribution: { photographer: string; photographerUrl: string } | null = null;
  if (article.coverImageAttribution) {
    try {
      photoAttribution = JSON.parse(article.coverImageAttribution);
    } catch {
      // ignore invalid attribution JSON
    }
  }

  // Split content into paragraphs
  const paragraphs = article.content.split("\n\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
            AI News
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-12">
        {article.categoryName && (
          <Link
            href={`/category/${article.categorySlug}`}
            className="text-sm text-blue-600 font-medium uppercase tracking-wide hover:text-blue-700"
          >
            {article.categoryName}
          </Link>
        )}

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mt-3 mb-4 leading-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>
        )}

        <div className="flex items-center text-sm text-gray-500 mb-8 pb-8 border-b">
          <span className="font-medium text-gray-700">{article.authorName}</span>
          <span className="mx-2">&middot;</span>
          <time>
            {article.publishedAt &&
              new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
          </time>
        </div>

        {article.coverImage && (
          <div className="mb-8">
            <div className="rounded-lg overflow-hidden">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full"
              />
            </div>
            {photoAttribution && (
              <p className="text-xs text-gray-400 mt-2">
                Photo by{" "}
                <a
                  href={`${photoAttribution.photographerUrl}?utm_source=ainews&utm_medium=referral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-600"
                >
                  {photoAttribution.photographer}
                </a>{" "}
                on{" "}
                <a
                  href="https://unsplash.com/?utm_source=ainews&utm_medium=referral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-600"
                >
                  Unsplash
                </a>
              </p>
            )}
          </div>
        )}

        <div className="prose prose-lg max-w-none text-gray-800">
          {paragraphs.map((p, i) => (
            <p key={i} className="mb-4 leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </article>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            &larr; Back to all articles
          </Link>
        </div>
      </footer>
    </div>
  );
}
