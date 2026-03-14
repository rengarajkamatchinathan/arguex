import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { debates, arguments_, users } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const debateRows = await db
      .select({
        debate: debates,
        author: {
          id: users.id,
          username: users.username,
          avatarUrl: users.avatarUrl,
          reputationScore: users.reputationScore,
        },
      })
      .from(debates)
      .leftJoin(users, eq(debates.authorId, users.id))
      .where(eq(debates.id, id))
      .limit(1);

    if (!debateRows[0]) {
      return NextResponse.json({ error: "Debate not found" }, { status: 404 });
    }

    const argRows = await db
      .select({
        argument: arguments_,
        author: {
          id: users.id,
          username: users.username,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(arguments_)
      .leftJoin(users, eq(arguments_.authorId, users.id))
      .where(eq(arguments_.debateId, id))
      .orderBy(asc(arguments_.createdAt));

    const debate = {
      ...debateRows[0].debate,
      author: debateRows[0].author ?? { id: "", username: "unknown", avatarUrl: null, reputationScore: 0 },
    };

    const args = argRows.map((r) => ({
      ...r.argument,
      author: r.author ?? { id: "", username: "unknown", avatarUrl: null },
    }));

    return NextResponse.json({ debate, arguments: args });
  } catch (error) {
    console.error("GET /api/debates/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch debate" }, { status: 500 });
  }
}
