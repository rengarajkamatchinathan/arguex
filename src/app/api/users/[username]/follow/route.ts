import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, userFollows, notifications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getOrCreateUser } from "@/lib/get-or-create-user";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const currentUser = await getOrCreateUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Find target user
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.id === currentUser.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  // Check if already following
  const [existing] = await db
    .select()
    .from(userFollows)
    .where(
      and(
        eq(userFollows.followerId, currentUser.id),
        eq(userFollows.followingId, targetUser.id)
      )
    )
    .limit(1);

  if (existing) {
    // Unfollow
    await db.delete(userFollows).where(eq(userFollows.id, existing.id));
    // -1 reputation
    await db
      .update(users)
      .set({ reputationScore: Math.max(0, targetUser.reputationScore - 1) })
      .where(eq(users.id, targetUser.id));
    return NextResponse.json({ following: false });
  } else {
    // Follow
    await db.insert(userFollows).values({
      id: nanoid(),
      followerId: currentUser.id,
      followingId: targetUser.id,
    });
    // +1 reputation
    await db
      .update(users)
      .set({ reputationScore: targetUser.reputationScore + 1 })
      .where(eq(users.id, targetUser.id));
    // Notify
    await db.insert(notifications).values({
      id: nanoid(),
      userId: targetUser.id,
      type: "FOLLOW",
      message: `@${currentUser.username} started following you`,
    });
    return NextResponse.json({ following: true });
  }
}
