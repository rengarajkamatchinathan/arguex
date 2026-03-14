import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { debates } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  // Unnest the tags array and return distinct values ordered by frequency
  const rows = await db.execute(
    sql`SELECT tag, COUNT(*) as count
        FROM debates, unnest(tags) AS tag
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 50`
  );

  const tags = (rows.rows as { tag: string }[]).map((r) => r.tag).filter(Boolean);
  return NextResponse.json(tags);
}
