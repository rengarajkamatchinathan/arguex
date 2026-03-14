import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, debates, arguments_ } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getOrCreateUser } from "@/lib/get-or-create-user";

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
      .where(eq(users.username, username))
      .limit(1);
  }

  if (!userRows[0]) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = userRows[0];

  const [userDebates, userArgs] = await Promise.all([
    db.select().from(debates).where(eq(debates.authorId, user.id)).orderBy(desc(debates.createdAt)).limit(10),
    db.select().from(arguments_).where(eq(arguments_.authorId, user.id)).orderBy(desc(arguments_.createdAt)).limit(10),
  ]);

  const totalVotes = userArgs.reduce((acc, a) => acc + a.upvotes, 0);

  return NextResponse.json({
    user,
    stats: {
      debatesCreated: userDebates.length,
      argumentsPosted: userArgs.length,
      totalVotesReceived: totalVotes,
    },
    recentDebates: userDebates,
    recentArguments: userArgs,
  });
}
