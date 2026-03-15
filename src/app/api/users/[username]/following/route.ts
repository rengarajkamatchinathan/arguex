import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, userFollows } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get all users this user follows
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
      reputationScore: users.reputationScore,
    })
    .from(userFollows)
    .innerJoin(users, eq(userFollows.followingId, users.id))
    .where(eq(userFollows.followerId, targetUser.id))
    .orderBy(userFollows.createdAt);

  return NextResponse.json(rows);
}
