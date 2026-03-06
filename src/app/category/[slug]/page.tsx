import { db, schema } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.slug, slug))
    .get();

  if (!category) {
    notFound();
  }

  const articles = db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      coverImage: schema.articles.coverImage,
      publishedAt: schema.articles.publishedAt,
      authorName: schema.users.name,
    })
    .from(schema.articles)
    .leftJoin(schema.users, eq(schema.articles.authorId, schema.users.id))
    .where(
      and(
        eq(schema.articles.categoryId, category.id),
        eq(schema.articles.status, "published")
      )
    )
    .orderBy(desc(schema.articles.publishedAt))
    .all();

  const categories = db.select().from(schema.categories).all();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
            AI News
          </Link>
          <nav className="flex items-center space-x-6">
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`text-sm ${
                  cat.slug === slug
                    ? "text-blue-600 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 mt-1">{category.description}</p>
          )}
        </div>

        {articles.length === 0 ? (
          <p className="text-gray-500">No articles in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="group"
              >
                <article>
                  {article.coverImage && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="text-xs text-gray-400">
                    {article.authorName} &middot;{" "}
                    {article.publishedAt &&
                      new Date(article.publishedAt).toLocaleDateString()}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} AI News. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
