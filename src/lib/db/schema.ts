import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

export const voteTypeEnum = pgEnum("vote_type", ["UP", "DOWN", "EVIDENCE"]);
export const debateSideEnum = pgEnum("debate_side", ["PRO", "CON"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "VOTE",
  "REPLY",
  "MENTION",
  "FOLLOW",
  "DEBATE_REPLY",
]);

// ── Users ──
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  name: text("name"),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  reputationScore: integer("reputation_score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── NextAuth: Accounts ──
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

// ── NextAuth: Sessions ──
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ── NextAuth: Verification Tokens ──
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

// ── Debates ──
export const debates = pgTable("debates", {
  id: text("id").primaryKey().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().default([]).notNull(),
  images: text("images").array().default([]).notNull(),
  authorId: text("author_id")
    .references(() => users.id)
    .notNull(),
  participantCount: integer("participant_count").default(0).notNull(),
  argCount: integer("arg_count").default(0).notNull(),
  proVotes: integer("pro_votes").default(0).notNull(),
  conVotes: integer("con_votes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Arguments ──
export const arguments_ = pgTable("arguments", {
  id: text("id").primaryKey().notNull(),
  debateId: text("debate_id")
    .references(() => debates.id)
    .notNull(),
  authorId: text("author_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  side: debateSideEnum("side").notNull(),
  parentId: text("parent_id"),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  evidenceCount: integer("evidence_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Votes ──
export const votes = pgTable("votes", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  argumentId: text("argument_id")
    .references(() => arguments_.id)
    .notNull(),
  voteType: voteTypeEnum("vote_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Notifications ──
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  type: notificationTypeEnum("type").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Debate Follows (bookmarks) ──
export const follows = pgTable("follows", {
  id: text("id").primaryKey().notNull(),
  followerId: text("follower_id")
    .references(() => users.id)
    .notNull(),
  followingDebateId: text("following_debate_id")
    .references(() => debates.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── User Follows ──
export const userFollows = pgTable("user_follows", {
  id: text("id").primaryKey().notNull(),
  followerId: text("follower_id")
    .references(() => users.id)
    .notNull(),
  followingId: text("following_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Type Exports ──
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Debate = typeof debates.$inferSelect;
export type NewDebate = typeof debates.$inferInsert;
export type Argument = typeof arguments_.$inferSelect;
export type NewArgument = typeof arguments_.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type UserFollow = typeof userFollows.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
