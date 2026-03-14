import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const top = await db
    .select({
      id: users.id,
      username: users.username,
      reputationScore: users.reputationScore,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .orderBy(desc(users.reputationScore))
    .limit(5);

  return NextResponse.json(top);
}
