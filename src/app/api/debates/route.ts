import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { debates, users } from "@/lib/db/schema";
import { eq, ilike, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getOrCreateUser } from "@/lib/get-or-create-user";
import { arguments_ } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
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
    }));

    return NextResponse.json({ debates: result, total: result.length, hasMore: result.length === limit });
  } catch (error) {
    console.error("GET /api/debates error:", error);
    return NextResponse.json({ error: "Failed to fetch debates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, category, description, tags } = body;

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
      authorId: dbUser.id,
      participantCount: 1,
      argCount: 0,
      proVotes: 0,
      conVotes: 0,
    });

    const newDebate = await db.select().from(debates).where(eq(debates.id, id)).limit(1);
    return NextResponse.json(newDebate[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/debates error:", error);
    return NextResponse.json({ error: "Failed to create debate" }, { status: 500 });
  }
}
