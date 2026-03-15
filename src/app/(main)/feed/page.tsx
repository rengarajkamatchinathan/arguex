"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  Share2,
  TrendingUp,
  Trophy,
  Flame,
  Hash,
  Bookmark,
  ArrowUpRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getReputationLevel } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface DebateAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
  reputationScore: number;
}

interface Debate {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string[];
  authorId: string;
  participantCount: number;
  argCount: number;
  proVotes: number;
  conVotes: number;
  proArgCount: number;
  conArgCount: number;
  createdAt: string;
  updatedAt: string;
  author: DebateAuthor;
  followingArgued: { username: string; avatarUrl: string | null }[];
}

interface TrendingTopic {
  tag: string;
  count: number;
}
interface TopDebater {
  id: string;
  username: string;
  reputationScore: number;
  avatarUrl: string | null;
}

/* ─── PRO / CON Split Bar ─── */
function ArgSplitBar({ pro, con }: { pro: number; con: number }) {
  const total = pro + con;
  if (total === 0) return null;
  const proPercent = Math.round((pro / total) * 100);
  const conPercent = 100 - proPercent;
  return (
    <div className="mb-3">
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-blue-400 transition-all duration-700 ease-out"
          style={{ width: `${proPercent}%` }}
        />
        <div
          className="h-full bg-linear-to-r from-orange-400 to-orange-500 transition-all duration-700 ease-out"
          style={{ width: `${conPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px] text-blue-400 font-semibold tabular-nums">
          PRO {proPercent}%
        </span>
        <span className="text-[10px] text-white/20 tabular-nums">{total} arguments</span>
        <span className="text-[11px] text-orange-400 font-semibold tabular-nums">
          CON {conPercent}%
        </span>
      </div>
    </div>
  );
}

/* ─── Debate Card ─── */
function DebateCard({ debate }: { debate: Debate }) {
  const [shared, setShared] = useState(false);
  const tags = (debate.tags.length > 0 ? debate.tags : [debate.category]).slice(0, 4);
  const createdAt = new Date(debate.createdAt);
  const isHot = debate.argCount >= 3;
  const totalArgs = debate.proArgCount + debate.conArgCount;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/debate/${debate.id}`;
    navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <Link href={`/debate/${debate.id}`}>
      <article className="px-4 py-4 border-b border-white/6 hover:bg-white/2 transition-colors cursor-pointer group">
        {/* Header row — avatar + meta */}
        <div className="flex items-center gap-2.5 mb-3">
          <Link
            href={`/profile/${debate.author.username}`}
            onClick={(e) => e.stopPropagation()}
            className="shrink-0"
          >
            <Avatar className="w-8 h-8">
              {debate.author.avatarUrl && (
                <AvatarImage src={debate.author.avatarUrl} alt={debate.author.username} />
              )}
              <AvatarFallback className="text-[11px] font-semibold bg-white/6 text-white/40">
                {debate.author.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Link
              href={`/profile/${debate.author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[13px] font-medium text-white/50 hover:text-white/80 transition-colors truncate"
            >
              @{debate.author.username}
            </Link>
            <span className="text-white/15 text-[10px] shrink-0">·</span>
            <span className="text-[11px] text-white/25 shrink-0">{timeAgo(createdAt)}</span>
          </div>
          {isHot && (
            <span className="shrink-0 text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Hot
            </span>
          )}
        </div>

        {/* Title — the hero */}
        <h3 className="text-[16px] font-bold leading-snug text-white/95 mb-1.5 group-hover:text-white transition-colors line-clamp-2">
          {debate.title}
        </h3>

        {/* Description */}
        {debate.description && (
          <p className="text-[13px] text-white/40 leading-relaxed line-clamp-2 mb-2.5">
            {debate.description}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-indigo-400/80 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Debate images */}
        {debate.images && debate.images.length > 0 && (
          <div
            className={cn(
              "grid gap-0.5 rounded-xl overflow-hidden mb-3",
              debate.images.length === 1 && "grid-cols-1",
              debate.images.length === 2 && "grid-cols-2",
              debate.images.length >= 3 && "grid-cols-2"
            )}
          >
            {debate.images.slice(0, 4).map((url, i) => (
              <div
                key={i}
                className={cn(
                  "relative bg-white/5",
                  debate.images.length === 1 ? "aspect-video" : "aspect-square",
                  debate.images.length === 3 && i === 0 && "row-span-2 aspect-auto"
                )}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* PRO/CON bar */}
        <ArgSplitBar pro={debate.proArgCount} con={debate.conArgCount} />

        {/* Quick PRO/CON action — only when no arguments yet */}
        {totalArgs === 0 && (
          <div className="flex gap-2 mb-3">
            <div className="flex-1 text-center py-2 rounded-lg border border-blue-500/15 bg-blue-500/5 text-blue-400 text-[12px] font-semibold hover:bg-blue-500/10 transition-colors">
              Take PRO side
            </div>
            <div className="flex-1 text-center py-2 rounded-lg border border-orange-500/15 bg-orange-500/5 text-orange-400 text-[12px] font-semibold hover:bg-orange-500/10 transition-colors">
              Take CON side
            </div>
          </div>
        )}

        {/* Following argued — Instagram "liked by" style */}
        {debate.followingArgued && debate.followingArgued.length > 0 && (
          <div className="flex items-center gap-2 mb-2.5">
            {/* Stacked avatars */}
            <div className="flex -space-x-2">
              {debate.followingArgued.slice(0, 3).map((u, i) => (
                <Avatar key={u.username} className="w-5 h-5 border border-background" style={{ zIndex: 3 - i }}>
                  {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.username} />}
                  <AvatarFallback className="text-[8px] font-bold bg-white/10 text-white/50">
                    {u.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {/* Text */}
            <p className="text-[11px] text-white/35 leading-tight">
              <span className="text-white/60 font-medium">
                {debate.followingArgued.slice(0, 2).map((u) => u.username).join(", ")}
              </span>
              {debate.followingArgued.length > 2 && (
                <span> and <span className="text-white/60 font-medium">{debate.followingArgued.length - 2} other{debate.followingArgued.length - 2 > 1 ? "s" : ""}</span></span>
              )}
              {" "}argued
            </p>
          </div>
        )}

        {/* Engagement row */}
        <div className="flex items-center -ml-2">
          <span className="flex items-center gap-1.5 text-[12px] text-white/35 hover:text-blue-400 transition-colors rounded-full px-2 py-1 hover:bg-blue-500/10 group/btn">
            <MessageSquare className="w-4 h-4" />
            <span>{debate.argCount}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-white/35 hover:text-indigo-400 transition-colors rounded-full px-2 py-1 hover:bg-indigo-500/10 group/btn">
            <Users className="w-4 h-4" />
            <span>{debate.participantCount}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-white/35 hover:text-purple-400 transition-colors rounded-full px-2 py-1 hover:bg-purple-500/10 group/btn">
            <Bookmark className="w-4 h-4" />
          </span>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-[12px] text-white/35 hover:text-green-400 transition-colors rounded-full px-2 py-1 hover:bg-green-500/10 ml-auto"
          >
            <Share2 className="w-4 h-4" />
            <span>{shared ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </article>
    </Link>
  );
}

/* ─── Skeleton ─── */
function DebateCardSkeleton() {
  return (
    <div className="px-4 py-4 border-b border-white/6 animate-pulse">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-full bg-white/6 shrink-0" />
        <div className="h-3 w-28 rounded bg-white/6" />
      </div>
      <div className="h-4.5 w-full rounded bg-white/6 mb-2" />
      <div className="h-4.5 w-3/4 rounded bg-white/6 mb-2" />
      <div className="h-3 w-full rounded bg-white/6 mb-1.5" />
      <div className="h-3 w-1/2 rounded bg-white/6 mb-3" />
      <div className="h-1.5 w-full rounded-full bg-white/6 mb-3" />
      <div className="flex gap-4">
        <div className="h-3 w-10 rounded bg-white/6" />
        <div className="h-3 w-10 rounded bg-white/6" />
        <div className="h-3 w-10 rounded bg-white/6 ml-auto" />
      </div>
    </div>
  );
}

/* ─── Composer Prompt ─── */
function ComposerPrompt() {
  const { user } = useUser();
  const username = user?.username ?? user?.firstName ?? "you";
  const avatarUrl = user?.imageUrl ?? null;

  return (
    <Link href="/debate/create">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6 hover:bg-white/2 transition-colors cursor-pointer group">
        <Avatar className="w-8 h-8 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
          <AvatarFallback className="text-[12px] font-semibold bg-white/6 text-white/40">
            {username[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <span className="flex-1 text-[14px] text-white/20 group-hover:text-white/35 transition-colors">
          Start a debate...
        </span>
        <span className="shrink-0 text-[12px] font-bold text-indigo-400 border border-indigo-500/30 px-3.5 py-1.5 rounded-full group-hover:bg-indigo-500/10 transition-colors">
          Post
        </span>
      </div>
    </Link>
  );
}

/* ─── Fetcher ─── */
const fetcher = (url: string) => fetch(url).then((r) => r.json());

type FeedTab = "foryou" | "following";

/* ─── Feed Page ─── */
export default function FeedPage() {
  const [feedTab, setFeedTab] = useState<FeedTab>("foryou");

  const { data: debatesData, isLoading: loading } = useSWR("/api/debates", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
  const { data: followingData, isLoading: followingLoading } = useSWR(
    feedTab === "following" ? "/api/debates?following=true" : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 }
  );
  const { data: trendingData } = useSWR("/api/trending", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  const { data: leaderboardData } = useSWR("/api/leaderboard", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const allDebates: Debate[] = debatesData?.debates ?? [];
  const followingDebates: Debate[] = followingData?.debates ?? [];
  const debates = feedTab === "following" ? followingDebates : allDebates;
  const isLoading = feedTab === "following" ? followingLoading : loading;
  const trendingTopics: TrendingTopic[] = trendingData ?? [];
  const topDebaters: TopDebater[] = leaderboardData ?? [];

  const pickDebate = allDebates.find((d) => d.argCount >= 1) ?? allDebates[0] ?? null;

  return (
    <div className="flex justify-center gap-0 xl:gap-8 max-w-270 mx-auto">
      {/* ── FEED (center) ── */}
      <div className="flex-1 min-w-0 max-w-150 border-x border-white/6">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-white/6 bg-background/80 backdrop-blur-md">
          <div className="px-4 h-13 flex items-center justify-between">
            <h1 className="text-[18px] font-black text-white tracking-tight">
              Argue
              <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                X
              </span>
            </h1>
          </div>
          {/* Feed tabs */}
          <div className="flex">
            {(["foryou", "following"] as FeedTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFeedTab(tab)}
                className={cn(
                  "flex-1 py-3 text-[13px] font-bold transition-colors border-b-2 -mb-px",
                  feedTab === tab
                    ? "border-indigo-400 text-white"
                    : "border-transparent text-white/30 hover:text-white/60 hover:bg-white/2"
                )}
              >
                {tab === "foryou" ? "For You" : "Following"}
              </button>
            ))}
          </div>
        </div>

        <ComposerPrompt />

        {isLoading ? (
          [...Array(5)].map((_, i) => <DebateCardSkeleton key={i} />)
        ) : debates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/40 gap-3">
            <MessageSquare className="w-10 h-10 opacity-20" />
            <div className="text-center">
              <p className="font-bold text-white text-[15px]">
                {feedTab === "following" ? "No saved debates yet" : "No debates yet"}
              </p>
              <p className="text-[13px] mt-1">
                {feedTab === "following"
                  ? "Save debates to see them here."
                  : "Be the first to start a debate."}
              </p>
            </div>
            {feedTab !== "following" && (
              <Link
                href="/debate/create"
                className="mt-2 text-[13px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Start one &rarr;
              </Link>
            )}
          </div>
        ) : (
          debates.map((debate) => <DebateCard key={debate.id} debate={debate} />)
        )}
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="hidden xl:flex flex-col gap-5 w-75 shrink-0 pt-4">
        {/* Widget 1 — Pick a Side */}
        {pickDebate && (
          <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-white/6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                Pick a Side
              </p>
            </div>
            <div className="px-4 py-3">
              <Link href={`/debate/${pickDebate.id}`}>
                <p className="text-[14px] font-bold text-white leading-snug mb-4 hover:text-indigo-300 transition-colors line-clamp-3">
                  {pickDebate.title}
                </p>
              </Link>
              <div className="flex gap-2">
                <Link href={`/debate/${pickDebate.id}`} className="flex-1">
                  <div className="w-full py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[13px] font-bold text-center hover:bg-blue-500/20 hover:border-blue-500/40 transition-all">
                    PRO
                  </div>
                </Link>
                <Link href={`/debate/${pickDebate.id}`} className="flex-1">
                  <div className="w-full py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[13px] font-bold text-center hover:bg-orange-500/20 hover:border-orange-500/40 transition-all">
                    CON
                  </div>
                </Link>
              </div>
              <p className="text-[11px] text-white/20 mt-2.5 text-center">
                {pickDebate.argCount} argument{pickDebate.argCount !== 1 ? "s" : ""} ·{" "}
                {pickDebate.participantCount} debating
              </p>
            </div>
          </div>
        )}

        {/* Widget 2 — Top Debaters */}
        {topDebaters.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-white/6 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                Top Debaters
              </p>
            </div>
            <div className="py-1">
              {topDebaters.slice(0, 5).map((user, i) => {
                const level = getReputationLevel(user.reputationScore);
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <Link key={user.id} href={`/profile/${user.username}`}>
                    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors group">
                      <span className="text-[13px] w-5 text-center shrink-0">
                        {medals[i] ?? (
                          <span className="text-white/25 text-[12px] font-medium">{i + 1}</span>
                        )}
                      </span>
                      <Avatar className="w-7 h-7 shrink-0">
                        {user.avatarUrl && (
                          <AvatarImage src={user.avatarUrl} alt={user.username} />
                        )}
                        <AvatarFallback className="text-[11px] font-medium bg-white/6 text-white/40">
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white/80 group-hover:text-white transition-colors truncate">
                          @{user.username}
                        </p>
                        <p className={cn("text-[10px]", level.color)}>{level.label}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span className="text-[12px] font-bold text-orange-400 tabular-nums">
                          {user.reputationScore}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Widget 3 — Trending */}
        {trendingTopics.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-white/6 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                Trending
              </p>
            </div>
            <div className="py-1">
              {trendingTopics.slice(0, 6).map((topic, i) => (
                <Link key={topic.tag} href="/explore">
                  <div className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.03] transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] text-white/20 w-3 tabular-nums">{i + 1}</span>
                      <div>
                        <p className="text-[13px] font-semibold text-white/70 group-hover:text-indigo-400 transition-colors">
                          #{topic.tag}
                        </p>
                        <p className="text-[10px] text-white/25">{topic.count} debates</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-white/10 group-hover:text-indigo-400/50 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
