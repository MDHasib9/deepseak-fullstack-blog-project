import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/posts/:id
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 },
    );
  }
}

// PUT /api/posts/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, content } = body;

    const data: { title?: string; content?: string } = {};
    if (typeof title === "string" && title.trim()) data.title = title;
    if (typeof content === "string" && content.trim()) data.content = content;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data,
    });

    return NextResponse.json(post);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    console.error("Failed to update post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
}

// DELETE /api/posts/:id
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const {id } = await params
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}