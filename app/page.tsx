// app/page.tsx
import { prisma } from "@/lib/prisma";
import PostList from "@/components/PostList";

export default async function Home() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">📝 My Blog</h1>
        <PostList initialPosts={posts} />
      </div>
    </main>
  );
}