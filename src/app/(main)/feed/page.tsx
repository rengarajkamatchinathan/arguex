"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Trophy,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getReputationLevel } from "@/lib/constants";

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
  createdAt: string;
  updatedAt: string;
  author: DebateAuthor;
}

function VoteBar({ pro, con }: { pro: number; con: number }) {
  const total = pro + con;
  const proPercent = total > 0 ? Math.round((pro / total) * 100) : 50;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-blue-400 font-semibold w-12 text-right">{proPercent}%</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
          style={{ width: `${proPercent}%` }}
        />
      </div>
      <span className="text-orange-400 font-semibold w-12">{100 - proPercent}%</span>
    </div>
  );
}

function DebateCard({ debate }: { debate: Debate }) {
  const total = debate.proVotes + debate.conVotes;
  const proPercent = total > 0 ? Math.round((debate.proVotes / total) * 100) : 50;

  return (
    <Link href={`/debate/${debate.id}`}>
      <div className="p-5 rounded-2xl border border-border/60 bg-card hover:border-indigo-500/40 transition-all cursor-pointer group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {(debate.tags.length > 0 ? debate.tags : [debate.category]).slice(0, 4).map((tag) => (
                <Badge key={tag} className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20">
                  #{tag}
                </Badge>
              ))}
            </div>
            <h3 className="font-semibold text-sm sm:text-base group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2">
              {debate.title}
            </h3>
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {debate.description}
        </p>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span className="text-blue-400 font-medium">YES {proPercent}%</span>
            <span className="text-orange-400 font-medium">NO {100 - proPercent}%</span>
          </div>
          <VoteBar pro={debate.proVotes} con={debate.conVotes} />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {debate.argCount} args
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {debate.participantCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar className="w-4 h-4">
              <AvatarFallback className="text-[8px] bg-indigo-500/20 text-indigo-400">
                {debate.author.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>@{debate.author.username}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function DebateCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-border/60 bg-card animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-5 w-14 rounded-full bg-muted" />
      </div>
      <div className="h-5 w-3/4 rounded bg-muted mb-2" />
      <div className="h-4 w-full rounded bg-muted mb-1" />
      <div className="h-4 w-2/3 rounded bg-muted mb-4" />
      <div className="h-2 w-full rounded-full bg-muted mb-3" />
      <div className="flex justify-between">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}

interface TrendingTopic { tag: string; count: number; }
interface TopDebater { id: string; username: string; reputationScore: number; avatarUrl: string | null; }

export default function FeedPage() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [topDebaters, setTopDebaters] = useState<TopDebater[]>([]);

  useEffect(() => {
    fetch("/api/trending").then((r) => r.json()).then(setTrendingTopics).catch(() => {});
    fetch("/api/leaderboard").then((r) => r.json()).then(setTopDebaters).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/debates")
      .then((r) => r.json())
      .then((d) => setDebates(d.debates ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* Center Feed */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold">
              All Debates
              {!loading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {debates.length} debates
                </span>
              )}
            </h1>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <DebateCardSkeleton key={i} />
              ))}
            </div>
          ) : debates.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No debates found</p>
              <p className="text-sm mt-1">Try a different search</p>
            </div>
          ) : (
            <div className="space-y-4">
              {debates.map((debate) => (
                <DebateCard key={debate.id} debate={debate} />
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="hidden xl:block w-64 shrink-0">
          <div className="sticky top-6 space-y-5">
            {/* Trending Topics */}
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <h3 className="font-semibold text-sm">Trending Topics</h3>
              </div>
              <div className="space-y-2">
                {trendingTopics.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No topics yet.</p>
                ) : null}
                {trendingTopics.map((topic, i) => (
                  <Link
                    key={topic.tag}
                    href={`/explore`}
                    className="flex items-center justify-between py-1.5 cursor-pointer hover:text-indigo-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium">#{topic.tag}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {topic.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Debaters */}
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-sm">Top Debaters</h3>
                <span className="text-xs text-muted-foreground ml-1">this week</span>
              </div>
              <div className="space-y-3">
                {topDebaters.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No debaters yet.</p>
                ) : topDebaters.map((user, i) => {
                  const rank = i + 1;
                  const level = getReputationLevel(user.reputationScore);
                  return (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-3 group"
                    >
                      <span className={cn(
                        "text-xs font-bold w-5 text-center",
                        rank === 1 ? "text-amber-400" : rank === 2 ? "text-slate-300" : rank === 3 ? "text-orange-400" : "text-muted-foreground"
                      )}>
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                      </span>
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="text-xs bg-indigo-500/20 text-indigo-400">
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate group-hover:text-indigo-400 transition-colors">
                          @{user.username}
                        </p>
                        <p className={cn("text-[10px]", level.color)}>{level.label}</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-orange-400">
                        <Flame className="w-3 h-3" />
                        <span className="text-xs font-semibold">{user.reputationScore}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
