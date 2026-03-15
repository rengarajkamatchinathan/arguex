import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
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

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  clerkId: text("clerk_id").unique().notNull(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  reputationScore: integer("reputation_score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
