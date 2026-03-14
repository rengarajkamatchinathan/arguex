import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { follows } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getOrCreateUser } from "@/lib/get-or-create-user";

// GET /api/follows?debateId=xxx  → check if current user follows this debate
export async function GET(req: NextRequest) {
  const debateId = req.nextUrl.searchParams.get("debateId");
  if (!debateId) {
    return NextResponse.json({ error: "debateId required" }, { status: 400 });
  }

  const dbUser = await getOrCreateUser();
  if (!dbUser) {
    return NextResponse.json({ following: false });
  }

  const row = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, dbUser.id), eq(follows.followingDebateId, debateId)))
    .limit(1);

  return NextResponse.json({ following: !!row[0] });
}

// POST /api/follows  → toggle follow/unfollow
export async function POST(req: NextRequest) {
  const dbUser = await getOrCreateUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { debateId } = await req.json();
  if (!debateId) {
    return NextResponse.json({ error: "debateId required" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, dbUser.id), eq(follows.followingDebateId, debateId)))
    .limit(1);

  if (existing[0]) {
    await db.delete(follows).where(eq(follows.id, existing[0].id));
    return NextResponse.json({ following: false });
  }

  await db.insert(follows).values({
    id: nanoid(),
    followerId: dbUser.id,
    followingDebateId: debateId,
  });

  return NextResponse.json({ following: true });
}
