"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Post } from "../generated/prisma/client";  // Prisma provides the type!

interface Props {
  initialPosts: Post[];
}

export default function PostList({ initialPosts }: Props) {
  // We'll keep local state for the posts so we can optimistically update
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const router = useRouter();

  // Add a new post via API, then update local state
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      const post: Post = await res.json();
      setPosts((prev) => [post, ...prev]);
      setNewTitle("");
      setNewContent("");
      router.refresh(); // refreshes server components (optional, but good practice)
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete a post
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Create Post Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Post title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <textarea
          placeholder="Write your content..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={4}
          className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Publish
        </button>
      </form>

      {/* Posts list */}
      {posts.length === 0 ? (
        <p className="text-gray-500 text-center">No posts yet. Write your first one!</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <p className="text-gray-600 mt-1 whitespace-pre-wrap">{post.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-500 hover:text-red-700 transition-colors ml-4"
                  title="Delete post"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}