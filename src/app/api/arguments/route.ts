import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { arguments_, debates, notifications, users } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getOrCreateUser } from "@/lib/get-or-create-user";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
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

    // Increment participantCount if this is the user's first argument in this debate
    const priorArgs = await db
      .select({ id: arguments_.id })
      .from(arguments_)
      .where(and(eq(arguments_.debateId, debateId), eq(arguments_.authorId, dbUser.id)))
      .limit(2);
    if (priorArgs.length === 1) {
      // Only the one we just inserted — first time participant
      await db.update(debates)
        .set({ participantCount: sql`${debates.participantCount} + 1` })
        .where(eq(debates.id, debateId));
    }

    // Award reputation: +3 for argument, +2 for reply
    const repGain = parentId ? 2 : 3;
    await db.update(users)
      .set({ reputationScore: sql`${users.reputationScore} + ${repGain}` })
      .where(eq(users.id, dbUser.id));

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

    // Detect @mentions and notify mentioned users
    const mentions = content.match(/@([a-z0-9_]+)/gi);
    if (mentions) {
      const mentionedUsernames = Array.from(new Set<string>(mentions.map((m: string) => m.slice(1).toLowerCase())));
      for (const mentioned of mentionedUsernames) {
        if (mentioned === dbUser.username) continue; // don't notify self
        const mentionedRows = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.username, mentioned))
          .limit(1);
        if (mentionedRows[0]) {
          await db.insert(notifications).values({
            id: nanoid(),
            userId: mentionedRows[0].id,
            type: "MENTION",
            message: `@${dbUser.username} mentioned you in an argument`,
            read: false,
          });
        }
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
