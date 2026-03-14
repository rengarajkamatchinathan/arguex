import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Fetches the DB user for the currently authenticated Clerk user.
 * If they don't exist yet (webhook not set up), auto-creates them.
 */
export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (existing[0]) return existing[0];

  // Auto-create user if not in DB yet (webhook not configured)
  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
  const rawUsername =
    clerkUser.username ??
    clerkUser.firstName ??
    email.split("@")[0];
  const username = rawUsername.replace(/[^a-z0-9_]/gi, "_").toLowerCase();

  // Handle username collision by appending random suffix
  const finalUsername = `${username}_${nanoid(4)}`;

  const [newUser] = await db
    .insert(users)
    .values({
      id: nanoid(),
      clerkId: clerkUser.id,
      username: finalUsername,
      email,
      avatarUrl: clerkUser.imageUrl ?? null,
      reputationScore: 0,
    })
    .onConflictDoNothing()
    .returning();

  // If conflict on clerkId (race condition), just fetch again
  if (!newUser) {
    const retry = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUser.id))
      .limit(1);
    return retry[0] ?? null;
  }

  return newUser;
}
