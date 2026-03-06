import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      slug: schema.articles.slug,
      excerpt: schema.articles.excerpt,
      coverImage: schema.articles.coverImage,
      publishedAt: schema.articles.publishedAt,
      categoryName: schema.categories.name,
      categorySlug: schema.categories.slug,
      authorName: schema.users.name,
    })
    .from(schema.articles)
    .leftJoin(schema.categories, eq(schema.articles.categoryId, schema.categories.id))
    .leftJoin(schema.users, eq(schema.articles.authorId, schema.users.id))
    .where(eq(schema.articles.status, "published"))
    .orderBy(desc(schema.articles.publishedAt))
    .limit(20)
    .all();

  const categories = db.select().from(schema.categories).all();

  const featured = articles[0];
  const rest = articles.slice(1);

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
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Editorial
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl text-gray-500">No articles published yet</h2>
            <p className="text-gray-400 mt-2">Check back soon for the latest news.</p>
          </div>
        ) : (
          <>
            {featured && (
              <Link href={`/article/${featured.slug}`} className="block mb-12 group">
                <article className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featured.coverImage && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={featured.coverImage}
                        alt={featured.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`flex flex-col justify-center ${!featured.coverImage ? "lg:col-span-2" : ""}`}>
                    {featured.categoryName && (
                      <span className="text-sm text-blue-600 font-medium mb-2">
                        {featured.categoryName}
                      </span>
                    )}
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                      {featured.title}
                    </h1>
                    {featured.excerpt && (
                      <p className="text-lg text-gray-600 mb-4">{featured.excerpt}</p>
                    )}
                    <div className="text-sm text-gray-400">
                      {featured.authorName} &middot;{" "}
                      {featured.publishedAt &&
                        new Date(featured.publishedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {rest.length > 0 && (
              <>
                <hr className="mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {rest.map((article) => (
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
                        {article.categoryName && (
                          <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                            {article.categoryName}
                          </span>
                        )}
                        <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mt-1 mb-2">
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
              </>
            )}
          </>
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
