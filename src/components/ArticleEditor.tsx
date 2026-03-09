"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface UnsplashPhoto {
  id: string;
  thumbnail: string;
  fullUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

interface ArticleData {
  id?: number;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverImageAttribution?: string;
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
  const [coverImageAttribution, setCoverImageAttribution] = useState(
    article?.coverImageAttribution || ""
  );
  const [categoryId, setCategoryId] = useState<number | null>(
    article?.categoryId || null
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unsplash search state
  const [showPhotoSearch, setShowPhotoSearch] = useState(false);
  const [photoQuery, setPhotoQuery] = useState("");
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [searchingPhotos, setSearchingPhotos] = useState(false);
  const [downloadingPhoto, setDownloadingPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      setCoverImage(data.url);
      setCoverImageAttribution("");
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handlePhotoSearch() {
    if (!photoQuery.trim()) return;
    setSearchingPhotos(true);
    setError("");
    try {
      const res = await fetch(
        `/api/photos/search?query=${encodeURIComponent(photoQuery)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Photo search failed");
        return;
      }
      setPhotos(data.photos);
    } catch {
      setError("Photo search failed");
    } finally {
      setSearchingPhotos(false);
    }
  }

  async function handleSelectPhoto(photo: UnsplashPhoto) {
    setDownloadingPhoto(photo.id);
    setError("");
    try {
      const res = await fetch("/api/photos/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoUrl: photo.fullUrl,
          photographer: photo.photographer,
          photographerUrl: photo.photographerUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to download photo");
        return;
      }
      setCoverImage(data.url);
      setCoverImageAttribution(data.attribution);
      setShowPhotoSearch(false);
      setPhotos([]);
      setPhotoQuery("");
    } catch {
      setError("Failed to download photo");
    } finally {
      setDownloadingPhoto(null);
    }
  }

  function getAttribution(): { photographer: string; photographerUrl: string } | null {
    if (!coverImageAttribution) return null;
    try {
      return JSON.parse(coverImageAttribution);
    } catch {
      return null;
    }
  }

  async function handleSave(status: string) {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const body = {
        title,
        excerpt,
        content,
        coverImage,
        coverImageAttribution,
        categoryId,
        status,
      };
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

  const attribution = getAttribution();

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
              Cover Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              className="hidden"
            />
            {coverImage ? (
              <div className="relative">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-md border border-gray-300"
                />
                {attribution && (
                  <div className="mt-1 text-xs text-gray-500">
                    Photo by{" "}
                    <a
                      href={`${attribution.photographerUrl}?utm_source=ainews&utm_medium=referral`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {attribution.photographer}
                    </a>{" "}
                    on{" "}
                    <a
                      href="https://unsplash.com/?utm_source=ainews&utm_medium=referral"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Unsplash
                    </a>
                  </div>
                )}
                <div className="absolute top-1 right-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 bg-white/90 text-gray-700 rounded text-xs hover:bg-white"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPhotoSearch(true)}
                    className="px-2 py-1 bg-white/90 text-blue-600 rounded text-xs hover:bg-white"
                  >
                    Search Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImage("");
                      setCoverImageAttribution("");
                    }}
                    className="px-2 py-1 bg-white/90 text-red-600 rounded text-xs hover:bg-white"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600"
                >
                  {uploading ? "Uploading..." : "Upload image"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPhotoSearch(true)}
                  className="flex-1 h-32 border-2 border-dashed border-blue-300 rounded-md flex items-center justify-center text-sm text-blue-500 hover:border-blue-400 hover:text-blue-600"
                >
                  Search Unsplash
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Unsplash Photo Search Panel */}
        {showPhotoSearch && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                Search Unsplash Photos
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowPhotoSearch(false);
                  setPhotos([]);
                  setPhotoQuery("");
                }}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Close
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={photoQuery}
                onChange={(e) => setPhotoQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlePhotoSearch();
                  }
                }}
                placeholder="Search for photos..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white"
              />
              <button
                type="button"
                onClick={handlePhotoSearch}
                disabled={searchingPhotos}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {searchingPhotos ? "Searching..." : "Search"}
              </button>
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => handleSelectPhoto(photo)}
                    disabled={downloadingPhoto !== null}
                    className="relative group rounded-md overflow-hidden aspect-video bg-gray-100 hover:ring-2 hover:ring-blue-500 disabled:opacity-50"
                  >
                    <img
                      src={photo.thumbnail}
                      alt={photo.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                      <span className="text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate w-full">
                        {photo.photographer}
                      </span>
                    </div>
                    {downloadingPhoto === photo.id && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-sm text-gray-600">
                          Downloading...
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
            {photos.length === 0 && !searchingPhotos && photoQuery && (
              <p className="text-sm text-gray-500 text-center py-4">
                No photos found. Try a different search term.
              </p>
            )}
          </div>
        )}

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
