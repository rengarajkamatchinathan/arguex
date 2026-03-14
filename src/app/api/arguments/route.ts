import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { arguments_, debates, notifications } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getOrCreateUser } from "@/lib/get-or-create-user";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { debateId, content, side, parentId } = body;

  if (!debateId || !content || !side) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["PRO", "CON"].includes(side)) {
    return NextResponse.json({ error: "Invalid side" }, { status: 400 });
  }

  try {
    const dbUser = await getOrCreateUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const id = nanoid();
    await db.insert(arguments_).values({
      id,
      debateId,
      authorId: dbUser.id,
      content,
      side: side as "PRO" | "CON",
      parentId: parentId ?? null,
      upvotes: 0,
      downvotes: 0,
      evidenceCount: 0,
    });

    // Increment debate argCount
    await db.update(debates)
      .set({ argCount: sql`${debates.argCount} + 1` })
      .where(eq(debates.id, debateId));

    // If this is a reply, notify the parent argument's author
    if (parentId) {
      const parentRows = await db
        .select()
        .from(arguments_)
        .where(eq(arguments_.id, parentId))
        .limit(1);
      const parent = parentRows[0];
      if (parent && parent.authorId !== dbUser.id) {
        await db.insert(notifications).values({
          id: nanoid(),
          userId: parent.authorId,
          type: "REPLY",
          message: `@${dbUser.username} replied to your argument`,
          read: false,
        });
      }
    }

    return NextResponse.json({
      id,
      debateId,
      authorId: dbUser.id,
      content,
      side,
      parentId: parentId ?? null,
      upvotes: 0,
      downvotes: 0,
      evidenceCount: 0,
      createdAt: new Date().toISOString(),
      author: {
        id: dbUser.id,
        username: dbUser.username,
        avatarUrl: dbUser.avatarUrl,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/arguments error:", error);
    return NextResponse.json({ error: "Failed to post argument" }, { status: 500 });
  }
}
