import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { votes, arguments_ } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getOrCreateUser } from "@/lib/get-or-create-user";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { argumentId, voteType } = body;

  if (!argumentId || !voteType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["UP", "DOWN", "EVIDENCE"].includes(voteType)) {
    return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
  }

  try {
    const dbUser = await getOrCreateUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if vote already exists
    const existing = await db
      .select()
      .from(votes)
      .where(and(eq(votes.userId, dbUser.id), eq(votes.argumentId, argumentId)))
      .limit(1);

    if (existing[0]) {
      // Remove vote (toggle off)
      await db.delete(votes).where(eq(votes.id, existing[0].id));

      // Decrement the relevant count
      if (existing[0].voteType === "UP") {
        await db.update(arguments_)
          .set({ upvotes: sql`${arguments_.upvotes} - 1` })
          .where(eq(arguments_.id, argumentId));
      } else if (existing[0].voteType === "DOWN") {
        await db.update(arguments_)
          .set({ downvotes: sql`${arguments_.downvotes} - 1` })
          .where(eq(arguments_.id, argumentId));
      } else if (existing[0].voteType === "EVIDENCE") {
        await db.update(arguments_)
          .set({ evidenceCount: sql`${arguments_.evidenceCount} - 1` })
          .where(eq(arguments_.id, argumentId));
      }

      return NextResponse.json({ removed: true });
    }

    // Insert new vote
    const id = nanoid();
    await db.insert(votes).values({
      id,
      userId: dbUser.id,
      argumentId,
      voteType: voteType as "UP" | "DOWN" | "EVIDENCE",
    });

    // Increment the relevant count
    if (voteType === "UP") {
      await db.update(arguments_)
        .set({ upvotes: sql`${arguments_.upvotes} + 1` })
        .where(eq(arguments_.id, argumentId));
    } else if (voteType === "DOWN") {
      await db.update(arguments_)
        .set({ downvotes: sql`${arguments_.downvotes} + 1` })
        .where(eq(arguments_.id, argumentId));
    } else if (voteType === "EVIDENCE") {
      await db.update(arguments_)
        .set({ evidenceCount: sql`${arguments_.evidenceCount} + 1` })
        .where(eq(arguments_.id, argumentId));
    }

    const newVote = await db.select().from(votes).where(eq(votes.id, id)).limit(1);
    return NextResponse.json(newVote[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/votes error:", error);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}
