"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ArticleData {
  id?: number;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: number | null;
  status: string;
}

export default function ArticleEditor({
  article,
}: {
  article?: ArticleData;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState(article?.title || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [content, setContent] = useState(article?.content || "");
  const [coverImage, setCoverImage] = useState(article?.coverImage || "");
  const [categoryId, setCategoryId] = useState<number | null>(
    article?.categoryId || null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleSave(status: string) {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const body = { title, excerpt, content, coverImage, categoryId, status };
      const url = article?.id ? `/api/articles/${article.id}` : "/api/articles";
      const method = article?.id ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="w-full text-3xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 pb-2 bg-transparent text-gray-900 placeholder-gray-400"
          />
        </div>

        <div>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Brief excerpt or summary"
            className="w-full text-lg border-0 border-b border-gray-200 focus:border-blue-500 focus:ring-0 pb-2 bg-transparent text-gray-600 placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={categoryId || ""}
              onChange={(e) =>
                setCategoryId(e.target.value ? parseInt(e.target.value) : null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder="Write your article content here... (supports plain text)"
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 font-mono text-sm leading-relaxed"
          />
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Publishing..." : "Publish"}
          </button>
          <button
            onClick={() => router.push("/admin/articles")}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
