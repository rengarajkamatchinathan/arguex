import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const rows = await db.execute(
    sql`SELECT tag, COUNT(*) as count
        FROM debates, unnest(tags) AS tag
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 6`
  );

  const topics = (rows.rows as { tag: string; count: string }[]).map((r) => ({
    tag: r.tag,
    count: parseInt(r.count),
  }));

  return NextResponse.json(topics);
}
