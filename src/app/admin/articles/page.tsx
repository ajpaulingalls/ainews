import { db, schema } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = db
    .select({
      id: schema.articles.id,
      title: schema.articles.title,
      status: schema.articles.status,
      categoryName: schema.categories.name,
      authorName: schema.users.name,
      publishedAt: schema.articles.publishedAt,
      createdAt: schema.articles.createdAt,
    })
    .from(schema.articles)
    .leftJoin(schema.categories, eq(schema.articles.categoryId, schema.categories.id))
    .leftJoin(schema.users, eq(schema.articles.authorId, schema.users.id))
    .orderBy(desc(schema.articles.createdAt))
    .all();

  const statusColors: Record<string, string> = {
    draft: "bg-yellow-100 text-yellow-800",
    published: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-800",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          New Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500 mb-4">No articles yet</p>
          <Link href="/admin/articles/new" className="text-blue-600 hover:text-blue-700 font-medium">
            Write your first article →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[article.status]}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{article.categoryName || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{article.authorName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString()
                      : new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </Link>
                      <DeleteButton articleId={article.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
