import ArticleEditor from "@/components/ArticleEditor";

export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Article</h1>
      <ArticleEditor />
    </div>
  );
}
