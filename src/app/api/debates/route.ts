import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { debates, users, notifications, userFollows, follows } from "@/lib/db/schema";
import { eq, ilike, desc, and, sql, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getOrCreateUser } from "@/lib/get-or-create-user";
import { arguments_ } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const following = searchParams.get("following") === "true";
  const saved = searchParams.get("saved") === "true";
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const offset = parseInt(searchParams.get("offset") ?? "0");

  try {
    const conditions = [];
    if (category && category !== "All") {
      conditions.push(eq(debates.category, category));
    }
    if (search) {
      conditions.push(ilike(debates.title, `%${search}%`));
    }
    if (following) {
      const dbUser = await getOrCreateUser();
      if (dbUser) {
        // Get users I follow
        const followedUserRows = await db
          .select({ followingId: userFollows.followingId })
          .from(userFollows)
          .where(eq(userFollows.followerId, dbUser.id));
        const followedUserIds = followedUserRows.map((r) => r.followingId);
        if (followedUserIds.length === 0) {
          return NextResponse.json({ debates: [], total: 0, hasMore: false });
        }
        conditions.push(inArray(debates.authorId, followedUserIds));
      }
    }
    if (saved) {
      const dbUser = await getOrCreateUser();
      if (dbUser) {
        const savedRows = await db
          .select({ debateId: follows.followingDebateId })
          .from(follows)
          .where(eq(follows.followerId, dbUser.id));
        const savedIds = savedRows.map((r) => r.debateId);
        if (savedIds.length === 0) {
          return NextResponse.json({ debates: [], total: 0, hasMore: false });
        }
        conditions.push(inArray(debates.id, savedIds));
      }
    }

    const rows = await db
      .select({
        debate: debates,
        author: {
          id: users.id,
          username: users.username,
          avatarUrl: users.avatarUrl,
          reputationScore: users.reputationScore,
        },
        proArgCount: sql<number>`cast(count(case when ${arguments_.side} = 'PRO' then 1 end) as int)`,
        conArgCount: sql<number>`cast(count(case when ${arguments_.side} = 'CON' then 1 end) as int)`,
      })
      .from(debates)
      .leftJoin(users, eq(debates.authorId, users.id))
      .leftJoin(arguments_, eq(arguments_.debateId, debates.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(debates.id, users.id)
      .orderBy(desc(debates.createdAt))
      .limit(limit)
      .offset(offset);

    const result = rows.map((r) => ({
      ...r.debate,
      author: r.author ?? { id: "", username: "unknown", avatarUrl: null, reputationScore: 0 },
      proArgCount: r.proArgCount ?? 0,
      conArgCount: r.conArgCount ?? 0,
      followingArgued: [] as { username: string; avatarUrl: string | null }[],
    }));

    // Find which followed users argued in these debates
    let currentUser = null;
    try { currentUser = await getOrCreateUser(); } catch { /* not logged in */ }
    if (currentUser && result.length > 0) {
      const followedUserRows = await db
        .select({ followingId: userFollows.followingId })
        .from(userFollows)
        .where(eq(userFollows.followerId, currentUser.id));
      const followedIds = followedUserRows.map((r) => r.followingId);

      if (followedIds.length > 0) {
        const debateIds = result.map((d) => d.id);
        const arguedRows = await db
          .select({
            debateId: arguments_.debateId,
            username: users.username,
            avatarUrl: users.avatarUrl,
            authorId: arguments_.authorId,
          })
          .from(arguments_)
          .innerJoin(users, eq(arguments_.authorId, users.id))
          .where(
            and(
              inArray(arguments_.debateId, debateIds),
              inArray(arguments_.authorId, followedIds)
            )
          );

        // Group by debate, dedupe by user
        const byDebate = new Map<string, Map<string, { username: string; avatarUrl: string | null }>>();
        for (const row of arguedRows) {
          if (!byDebate.has(row.debateId)) byDebate.set(row.debateId, new Map());
          byDebate.get(row.debateId)!.set(row.authorId, { username: row.username, avatarUrl: row.avatarUrl });
        }
        for (const debate of result) {
          const userMap = byDebate.get(debate.id);
          if (userMap) debate.followingArgued = Array.from(userMap.values());
        }
      }
    }

    return NextResponse.json({ debates: result, total: result.length, hasMore: result.length === limit });
  } catch (error) {
    console.error("GET /api/debates error:", error);
    return NextResponse.json({ error: "Failed to fetch debates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, category, description, tags, images } = body;

  if (!title || !category || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const dbUser = await getOrCreateUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const id = nanoid();
    await db.insert(debates).values({
      id,
      title,
      description,
      category,
      tags: tags ?? [],
      images: images ?? [],
      authorId: dbUser.id,
      participantCount: 1,
      argCount: 0,
      proVotes: 0,
      conVotes: 0,
    });

    // Award reputation for creating a debate (+10)
    await db.update(users)
      .set({ reputationScore: sql`${users.reputationScore} + 10` })
      .where(eq(users.id, dbUser.id));

    const newDebate = await db.select().from(debates).where(eq(debates.id, id)).limit(1);
    return NextResponse.json(newDebate[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/debates error:", error);
    return NextResponse.json({ error: "Failed to create debate" }, { status: 500 });
  }
}
