CREATE TYPE "public"."debate_side" AS ENUM('PRO', 'CON');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('VOTE', 'REPLY', 'MENTION', 'FOLLOW', 'DEBATE_REPLY');--> statement-breakpoint
CREATE TYPE "public"."vote_type" AS ENUM('UP', 'DOWN', 'EVIDENCE');--> statement-breakpoint
CREATE TABLE "arguments" (
	"id" text PRIMARY KEY NOT NULL,
	"debate_id" text NOT NULL,
	"author_id" text NOT NULL,
	"content" text NOT NULL,
	"side" "debate_side" NOT NULL,
	"parent_id" text,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"downvotes" integer DEFAULT 0 NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debates" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL,
	"author_id" text NOT NULL,
	"participant_count" integer DEFAULT 0 NOT NULL,
	"arg_count" integer DEFAULT 0 NOT NULL,
	"pro_votes" integer DEFAULT 0 NOT NULL,
	"con_votes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" text PRIMARY KEY NOT NULL,
	"follower_id" text NOT NULL,
	"following_debate_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"reputation_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"argument_id" text NOT NULL,
	"vote_type" "vote_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "arguments" ADD CONSTRAINT "arguments_debate_id_debates_id_fk" FOREIGN KEY ("debate_id") REFERENCES "public"."debates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "arguments" ADD CONSTRAINT "arguments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debates" ADD CONSTRAINT "debates_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_debate_id_debates_id_fk" FOREIGN KEY ("following_debate_id") REFERENCES "public"."debates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_argument_id_arguments_id_fk" FOREIGN KEY ("argument_id") REFERENCES "public"."arguments"("id") ON DELETE no action ON UPDATE no action;