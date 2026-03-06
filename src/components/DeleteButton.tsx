"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ articleId }: { articleId: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this article?")) return;

    await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-600 hover:text-red-700"
    >
      Delete
    </button>
  );
}
