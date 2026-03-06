import { db, schema } from "@/lib/db";
import { eq, count } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const totalArticles = db
    .select({ count: count() })
    .from(schema.articles)
    .get()!.count;

  const publishedCount = db
    .select({ count: count() })
    .from(schema.articles)
    .where(eq(schema.articles.status, "published"))
    .get()!.count;

  const draftCount = db
    .select({ count: count() })
    .from(schema.articles)
    .where(eq(schema.articles.status, "draft"))
    .get()!.count;

  const categoryCount = db
    .select({ count: count() })
    .from(schema.categories)
    .get()!.count;

  const stats = [
    { label: "Total Articles", value: totalArticles, color: "bg-blue-50 text-blue-700" },
    { label: "Published", value: publishedCount, color: "bg-green-50 text-green-700" },
    { label: "Drafts", value: draftCount, color: "bg-yellow-50 text-yellow-700" },
    { label: "Categories", value: categoryCount, color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/admin/articles/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          New Article
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-lg p-6 ${stat.color}`}>
            <p className="text-sm font-medium opacity-75">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link
            href="/admin/articles/new"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Write a new article →
          </Link>
          <Link
            href="/admin/articles"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Manage articles →
          </Link>
        </div>
      </div>
    </div>
  );
}
