import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, debates, arguments_, userFollows } from "@/lib/db/schema";
import { eq, desc, and, ne, sql, ilike } from "drizzle-orm";
import { getOrCreateUser } from "@/lib/get-or-create-user";
import { computeBadges } from "@/lib/badges";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  if (username !== "me") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dbUser = await getOrCreateUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const updates: { bio?: string; avatarUrl?: string; bannerUrl?: string; username?: string } = {};
  if (typeof body.bio === "string") updates.bio = body.bio.trim();
  if (typeof body.avatarUrl === "string") updates.avatarUrl = body.avatarUrl.trim() || null as unknown as string;
  if (typeof body.bannerUrl === "string") updates.bannerUrl = body.bannerUrl.trim() || null as unknown as string;
  if (typeof body.username === "string") {
    const newUsername = body.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (newUsername.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
    }
    // Check uniqueness
    const existing = await db.select({ id: users.id }).from(users)
      .where(and(eq(users.username, newUsername), ne(users.id, dbUser.id))).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    updates.username = newUsername;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, dbUser.id))
    .returning();

  return NextResponse.json(updated);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  let userRows;

  if (username === "me") {
    // Resolve to the currently authenticated user
    const dbUser = await getOrCreateUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    userRows = [dbUser];
  } else {
    userRows = await db
      .select()
      .from(users)
      .where(ilike(users.username, username))
      .limit(1);
  }

  if (!userRows[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = userRows[0];

  // Get current user for isFollowing check
  let currentUser = null;
  try {
    currentUser = await getOrCreateUser();
  } catch {
    // Not authenticated — that's fine
  }

  const [userDebates, userArgs, followersCountResult, followingCountResult, isFollowingResult] = await Promise.all([
    db.select().from(debates).where(eq(debates.authorId, user.id)).orderBy(desc(debates.createdAt)).limit(10),
    db.select().from(arguments_).where(eq(arguments_.authorId, user.id)).orderBy(desc(arguments_.createdAt)).limit(10),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(userFollows).where(eq(userFollows.followingId, user.id)),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(userFollows).where(eq(userFollows.followerId, user.id)),
    currentUser
      ? db.select().from(userFollows).where(and(eq(userFollows.followerId, currentUser.id), eq(userFollows.followingId, user.id))).limit(1)
      : Promise.resolve([]),
  ]);

  const totalVotes = userArgs.reduce((acc, a) => acc + a.upvotes, 0);

  const stats = {
    debatesCreated: userDebates.length,
    argumentsPosted: userArgs.length,
    totalVotesReceived: totalVotes,
    followersCount: followersCountResult[0]?.count ?? 0,
    followingCount: followingCountResult[0]?.count ?? 0,
  };

  const badges = computeBadges({
    ...stats,
    reputationScore: user.reputationScore,
  });

  return NextResponse.json({
    user,
    stats,
    badges,
    isFollowing: isFollowingResult.length > 0,
    recentDebates: userDebates,
    recentArguments: userArgs,
  });
}
