import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "No webhook secret" }, { status: 500 });
  }

  const headersList = await headers();
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let payload: unknown;
  try {
    payload = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = payload as { type: string; data: Record<string, unknown> };

  if (type === "user.created") {
    const emailAddresses = data.email_addresses as Array<{ email_address: string }> | undefined;
    const email = emailAddresses?.[0]?.email_address ?? "";
    const rawUsername = data.username as string | undefined;
    const username = rawUsername ?? email.split("@")[0].replace(/[^a-z0-9_]/gi, "_");
    await db.insert(users).values({
      id: nanoid(),
      clerkId: data.id as string,
      username,
      email,
      avatarUrl: (data.image_url as string) ?? null,
      reputationScore: 0,
    }).onConflictDoNothing();
  }

  if (type === "user.updated") {
    const emailAddresses = data.email_addresses as Array<{ email_address: string }> | undefined;
    const email = emailAddresses?.[0]?.email_address ?? "";
    const rawUsername = data.username as string | undefined;
    const username = rawUsername ?? email.split("@")[0].replace(/[^a-z0-9_]/gi, "_");
    await db.update(users).set({
      email,
      username,
      avatarUrl: (data.image_url as string) ?? null,
    }).where(eq(users.clerkId, data.id as string));
  }

  if (type === "user.deleted") {
    await db.delete(users).where(eq(users.clerkId, data.id as string));
  }

  return NextResponse.json({ received: true });
}
