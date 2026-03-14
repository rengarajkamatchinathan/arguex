"use client";

import useSWR from "swr";
import Link from "next/link";
import { MessageSquare, Users, Share2, TrendingUp, Trophy, Flame, Hash } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
}

interface TrendingTopic { tag: string; count: number; }
interface TopDebater { id: string; username: string; reputationScore: number; avatarUrl: string | null; }

function ArgSplitBar({ pro, con }: { pro: number; con: number }) {
  const total = pro + con;
  if (total === 0) return null;
  const proPercent = Math.round((pro / total) * 100);
  return (
    <div className="mb-2">
      <div className="flex items-center gap-0 h-[3px] rounded-full overflow-hidden bg-white/5">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-700"
          style={{ width: `${proPercent}%` }}
        />
        <div
          className="h-full bg-orange-500 transition-all duration-700"
          style={{ width: `${100 - proPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] mt-1">
        <span className="text-blue-400 font-medium">PRO {proPercent}%</span>
        <span className="text-white/20 text-[10px]">{total} arguments</span>
        <span className="text-orange-400 font-medium">CON {100 - proPercent}%</span>
      </div>
    </div>
  );
}

function DebateCard({ debate }: { debate: Debate }) {
  const tags = (debate.tags.length > 0 ? debate.tags : [debate.category]).slice(0, 4);
  const createdAt = new Date(debate.createdAt);
  const isHot = debate.argCount >= 3;
  const participantCta = debate.participantCount <= 3
    ? `Be the ${debate.participantCount + 1}${debate.participantCount + 1 === 2 ? "nd" : debate.participantCount + 1 === 3 ? "rd" : "th"} to argue`
    : `${debate.participantCount} in debate`;

  return (
    <Link href={`/debate/${debate.id}`}>
      <article className="px-4 py-4 border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer group">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarFallback className="text-[11px] font-medium bg-white/6 text-white/35">
                {debate.author.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-medium text-white/45">
                @{debate.author.username}
              </span>
              <span className="text-white/15 text-[10px]">·</span>
              <span className="text-[11px] text-white/25">
                {timeAgo(createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isHot && (
              <span className="text-[11px] font-semibold text-orange-400 flex items-center gap-0.5">
                🔥 Hot
              </span>
            )}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="text-white/30 hover:text-white/70 transition-colors px-1"
            >
              <span className="text-lg leading-none">···</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[16px] font-bold leading-snug text-white mb-1.5 line-clamp-2">
          {debate.title}
        </h3>

        {/* Description */}
        {debate.description && (
          <p className="text-[13px] text-white/50 leading-relaxed line-clamp-2 mb-2">
            {debate.description}
          </p>
        )}

        {/* Hashtags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-0 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="text-[12px] text-indigo-400 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Arg split bar — only shown when there are arguments */}
        <ArgSplitBar pro={debate.proArgCount} con={debate.conArgCount} />

        {/* Engagement row */}
        <div className="flex items-center gap-5 text-white/40">
          <span className={cn("engage-btn")}>
            <MessageSquare className="w-[17px] h-[17px]" />
            <span>{debate.argCount} {debate.argCount === 1 ? "argument" : "arguments"}</span>
          </span>
          <span className={cn("engage-btn", debate.participantCount <= 3 && "text-indigo-400/70")}>
            <Users className="w-[17px] h-[17px]" />
            <span>{participantCta}</span>
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={cn("engage-btn ml-auto")}
          >
            <Share2 className="w-[17px] h-[17px]" />
            <span>Share</span>
          </button>
        </div>
      </article>
    </Link>
  );
}

function DebateCardSkeleton() {
  return (
    <div className="px-4 py-4 border-b border-white/5 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
        <div className="h-3.5 w-32 rounded bg-white/10" />
      </div>
      {/* Title */}
      <div className="h-4 w-full rounded bg-white/10 mb-2" />
      <div className="h-4 w-3/4 rounded bg-white/10 mb-2" />
      {/* Description */}
      <div className="h-3.5 w-full rounded bg-white/10 mb-1.5" />
      <div className="h-3.5 w-2/3 rounded bg-white/10 mb-3" />
      {/* Vote bar */}
      <div className="h-[3px] w-full rounded-full bg-white/10 mb-3" />
      {/* Engagement */}
      <div className="flex gap-4">
        <div className="h-3 w-12 rounded bg-white/10" />
        <div className="h-3 w-12 rounded bg-white/10" />
      </div>
    </div>
  );
}

function ComposerPrompt() {
  const { user } = useUser();
  const username = user?.username ?? user?.firstName ?? "you";

  return (
    <Link href="/debate/create">
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer group">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="text-[12px] font-medium bg-white/6 text-white/35">
            {username[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        {/* Placeholder text */}
        <span className="flex-1 text-[15px] text-white/25 group-hover:text-white/40 transition-colors">
          What&apos;s your take? Start a debate...
        </span>
        {/* Post button */}
        <span className="shrink-0 text-[13px] font-bold text-indigo-400 border border-indigo-500/40 px-3 py-1 rounded-full group-hover:bg-indigo-500/10 transition-colors">
          Debate
        </span>
      </div>
    </Link>
  );
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FeedPage() {
  const { data: debatesData, isLoading: loading } = useSWR("/api/debates", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // don't re-fetch within 30s
  });
  const { data: trendingData } = useSWR("/api/trending", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  const { data: leaderboardData } = useSWR("/api/leaderboard", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const debates: Debate[] = debatesData?.debates ?? [];
  const trendingTopics: TrendingTopic[] = trendingData ?? [];
  const topDebaters: TopDebater[] = leaderboardData ?? [];

  // Pick a random hot debate for "Pick a Side"
  const pickDebate = debates.find(d => d.argCount >= 1) ?? debates[0] ?? null;

  return (
    <div className="flex justify-center gap-0 xl:gap-8 max-w-270 mx-auto">

      {/* ── FEED (center) ── */}
      <div className="flex-1 min-w-0 max-w-150 border-x border-white/5">
        {/* Header */}
        <div className="sticky top-0 z-20 px-4 h-13.25 border-b border-white/5 bg-background/80 backdrop-blur-md flex items-center justify-between">
          <h1 className="text-[18px] font-black text-white tracking-tight">
            Argue<span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">X</span>
          </h1>
          {!loading && debates.length > 0 && (
            <span className="text-[12px] text-white/30 tabular-nums">{debates.length} debates</span>
          )}
        </div>

        <ComposerPrompt />

        {loading ? (
          [...Array(5)].map((_, i) => <DebateCardSkeleton key={i} />)
        ) : debates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/40 gap-3">
            <MessageSquare className="w-10 h-10 opacity-20" />
            <div className="text-center">
              <p className="font-bold text-white text-[15px]">No debates yet</p>
              <p className="text-[13px] mt-1">Be the first to start a debate.</p>
            </div>
            <Link href="/debate/create" className="mt-2 text-[13px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Start one &rarr;
            </Link>
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
            <div className="px-4 pt-4 pb-3 border-b border-white/5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Pick a Side</p>
            </div>
            <div className="px-4 py-3">
              <Link href={`/debate/${pickDebate.id}`}>
                <p className="text-[14px] font-bold text-white leading-snug mb-4 hover:text-indigo-300 transition-colors line-clamp-3">
                  {pickDebate.title}
                </p>
              </Link>
              <div className="flex gap-2">
                <Link href={`/debate/${pickDebate.id}`} className="flex-1">
                  <button className="w-full py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[13px] font-bold hover:bg-blue-500/20 hover:border-blue-500/40 transition-all">
                    PRO
                  </button>
                </Link>
                <Link href={`/debate/${pickDebate.id}`} className="flex-1">
                  <button className="w-full py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[13px] font-bold hover:bg-orange-500/20 hover:border-orange-500/40 transition-all">
                    CON
                  </button>
                </Link>
              </div>
              <p className="text-[11px] text-white/20 mt-2.5 text-center">
                {pickDebate.argCount} argument{pickDebate.argCount !== 1 ? "s" : ""} · {pickDebate.participantCount} debating
              </p>
            </div>
          </div>
        )}

        {/* Widget 2 — Top Debaters */}
        {topDebaters.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-white/5 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Top Debaters</p>
            </div>
            <div className="py-1">
              {topDebaters.slice(0, 5).map((user, i) => {
                const level = getReputationLevel(user.reputationScore);
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <Link key={user.id} href={`/profile/${user.username}`}>
                    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/3 transition-colors group">
                      <span className="text-[13px] w-5 text-center shrink-0">
                        {medals[i] ?? <span className="text-white/25 text-[12px] font-medium">{i + 1}</span>}
                      </span>
                      <Avatar className="w-7 h-7 shrink-0">
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
                        <span className="text-[12px] font-bold text-orange-400 tabular-nums">{user.reputationScore}</span>
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
            <div className="px-4 pt-4 pb-3 border-b border-white/5 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Trending</p>
            </div>
            <div className="py-1">
              {trendingTopics.slice(0, 6).map((topic, i) => (
                <Link key={topic.tag} href={`/explore`}>
                  <div className="flex items-center justify-between px-4 py-2.5 hover:bg-white/3 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] text-white/20 w-3 tabular-nums">{i + 1}</span>
                      <div>
                        <p className="text-[13px] font-semibold text-white/70 group-hover:text-indigo-400 transition-colors">
                          #{topic.tag}
                        </p>
                        <p className="text-[10px] text-white/25">{topic.count} debates</p>
                      </div>
                    </div>
                    <Hash className="w-3 h-3 text-white/15 group-hover:text-indigo-400/50 transition-colors" />
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
