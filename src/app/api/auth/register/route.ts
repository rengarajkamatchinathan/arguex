import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, username } = body;

  // Validate
  if (!email || !password || !username) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (cleanUsername.length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  // Check uniqueness
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.email, email.toLowerCase()), eq(users.username, cleanUsername)))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "Email or username already taken" }, { status: 409 });
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 12);
  const id = nanoid();

  await db.insert(users).values({
    id,
    username: cleanUsername,
    email: email.toLowerCase(),
    passwordHash,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
