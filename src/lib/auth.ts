import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, accounts as accountsTable, sessions, verificationTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accountsTable,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.avatarUrl,
          username: user.username,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        // Check if user already exists in DB
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        if (existing) {
          // User exists — make sure accounts link exists
          const [existingAccount] = await db
            .select()
            .from(accountsTable)
            .where(
              and(
                eq(accountsTable.provider, "google"),
                eq(accountsTable.providerAccountId, account.providerAccountId)
              )
            )
            .limit(1);

          if (!existingAccount) {
            // Create the link
            await db.insert(accountsTable).values({
              userId: existing.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token ?? null,
              refresh_token: account.refresh_token ?? null,
              expires_at: account.expires_at ?? null,
              token_type: account.token_type ?? null,
              scope: account.scope ?? null,
              id_token: account.id_token ?? null,
              session_state: (account.session_state as string) ?? null,
            });
          }

          // Update avatar from Google if not set
          if (!existing.avatarUrl && profile?.picture) {
            await db
              .update(users)
              .set({ avatarUrl: profile.picture as string })
              .where(eq(users.id, existing.id));
          }

          // Set user.id so JWT callback gets the right ID
          user.id = existing.id;
          user.name = existing.username;
          user.image = existing.avatarUrl;
          return true;
        } else {
          // New user — create with proper username
          const emailPrefix = user.email.split("@")[0].replace(/[^a-z0-9_]/gi, "_").toLowerCase();
          const username = `${emailPrefix}_${nanoid(4)}`;
          const id = nanoid();

          await db.insert(users).values({
            id,
            username,
            email: user.email,
            name: (profile?.name as string) ?? null,
            avatarUrl: (profile?.picture as string) ?? null,
            image: (profile?.picture as string) ?? null,
            reputationScore: 0,
          });

          // Create accounts link
          await db.insert(accountsTable).values({
            userId: id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token ?? null,
            refresh_token: account.refresh_token ?? null,
            expires_at: account.expires_at ?? null,
            token_type: account.token_type ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
            session_state: (account.session_state as string) ?? null,
          });

          user.id = id;
          user.name = username;
          user.image = (profile?.picture as string) ?? null;
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.username = (user as { username?: string }).username ?? user.name ?? "";
        token.avatarUrl = (user as { avatarUrl?: string | null }).avatarUrl ?? user.image ?? null;
      }

      // Refresh user data from DB on session update
      if (trigger === "update" || !token.username) {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, token.id))
          .limit(1);
        if (dbUser) {
          token.username = dbUser.username;
          token.avatarUrl = dbUser.avatarUrl;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.image = token.avatarUrl ?? null;
      return session;
    },
  },
});
