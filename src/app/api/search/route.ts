import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { debates, users } from "@/lib/db/schema";
import { ilike, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ debates: [], users: [], hashtags: [] });
  }

  const [debateRows, userRows, hashtagRows] = await Promise.all([
    // Search debates by title or description
    db
      .select({
        id: debates.id,
        title: debates.title,
        category: debates.category,
        tags: debates.tags,
        argCount: debates.argCount,
        participantCount: debates.participantCount,
        proVotes: debates.proVotes,
        conVotes: debates.conVotes,
      })
      .from(debates)
      .where(
        or(
          ilike(debates.title, `%${q}%`),
          ilike(debates.description, `%${q}%`)
        )
      )
      .limit(10),

    // Search users by username
    db
      .select({
        id: users.id,
        username: users.username,
        bio: users.bio,
        reputationScore: users.reputationScore,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(ilike(users.username, `%${q}%`))
      .limit(10),

    // Search hashtags (tags array contains the query)
    db.execute(
      sql`SELECT tag, COUNT(*) as count
          FROM debates, unnest(tags) AS tag
          WHERE tag ILIKE ${`%${q}%`}
          GROUP BY tag
          ORDER BY count DESC
          LIMIT 10`
    ),
  ]);

  return NextResponse.json({
    debates: debateRows,
    users: userRows,
    hashtags: (hashtagRows.rows as { tag: string; count: string }[]).map((r) => ({
      tag: r.tag,
      count: parseInt(r.count),
    })),
  });
}
