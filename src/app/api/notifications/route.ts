import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getOrCreateUser } from "@/lib/get-or-create-user";

export async function GET() {
  const dbUser = await getOrCreateUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, dbUser.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  return NextResponse.json(rows);
}

export async function PATCH(_req: NextRequest) {
  const dbUser = await getOrCreateUser();
  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, dbUser.id));

  return NextResponse.json({ success: true });
}
