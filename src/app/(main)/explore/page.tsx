"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Users,
  MessageSquare,
  Hash,
  X,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, timeAgo } from "@/lib/utils";
import { getReputationLevel } from "@/lib/constants";

interface DebateResult {
  id: string;
  title: string;
  category: string;
  tags: string[];
  argCount: number;
  participantCount: number;
  proVotes: number;
  conVotes: number;
}

interface UserResult {
  id: string;
  username: string;
  bio: string | null;
  reputationScore: number;
  avatarUrl: string | null;
}

interface HashtagResult {
  tag: string;
  count: number;
}

interface SearchResults {
  debates: DebateResult[];
  users: UserResult[];
  hashtags: HashtagResult[];
}

type Tab = "debates" | "users" | "hashtags";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("debates");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);

  // Default state (no query)
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [trendingDebates, setTrendingDebates] = useState<DebateResult[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setTrendingHashtags(Array.isArray(d) ? d.slice(0, 20) : []))
      .catch(() => {});
    fetch("/api/debates?limit=6")
      .then((r) => r.json())
      .then((d) => setTrendingDebates(d.debates ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data);
      } catch {
        //
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = results
    ? results.debates.length + results.users.length + results.hashtags.length
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search debates, users, #hashtags..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-muted/50 border border-border/60 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/50 transition-colors"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search results */}
      {query.trim() ? (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl bg-muted/30 border border-border/40">
            {(["debates", "users", "hashtags"] as Tab[]).map((tab) => {
              const count = results
                ? tab === "debates"
                  ? results.debates.length
                  : tab === "users"
                  ? results.users.length
                  : results.hashtags.length
                : 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize",
                    activeTab === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                  {results && (
                    <span className="ml-1.5 text-xs opacity-60">({count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {searching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : !results || totalResults === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No results for &quot;{query}&quot;</p>
            </div>
          ) : (
            <>
              {/* Debates tab */}
              {activeTab === "debates" && (
                <div className="space-y-3">
                  {results.debates.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No debates found</p>
                  ) : (
                    results.debates.map((d) => (
                      <Link key={d.id} href={`/debate/${d.id}`}>
                        <div className="flex items-start gap-3 p-4 rounded-2xl border border-border/60 bg-card hover:border-indigo-500/40 transition-all cursor-pointer group">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2">
                              {d.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {(d.tags.length > 0 ? d.tags : [d.category]).slice(0, 3).map((tag) => (
                                <span key={tag} className="text-xs text-indigo-400">#{tag}</span>
                              ))}
                              <span className="text-xs text-muted-foreground">· {d.argCount} args</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}

              {/* Users tab */}
              {activeTab === "users" && (
                <div className="space-y-3">
                  {results.users.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
                  ) : (
                    results.users.map((u) => {
                      const level = getReputationLevel(u.reputationScore);
                      return (
                        <Link key={u.id} href={`/profile/${u.username}`}>
                          <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-card hover:border-indigo-500/40 transition-all cursor-pointer group">
                            <Avatar className="w-10 h-10 shrink-0">
                              <AvatarFallback className="bg-indigo-500/20 text-indigo-400 font-semibold">
                                {u.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold group-hover:text-indigo-400 transition-colors">
                                  @{u.username}
                                </p>
                                <span className={cn("text-xs", level.color)}>{level.label}</span>
                              </div>
                              {u.bio && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{u.bio}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-orange-400 shrink-0">
                              <Flame className="w-3.5 h-3.5" />
                              <span className="text-xs font-semibold">{u.reputationScore}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}

              {/* Hashtags tab */}
              {activeTab === "hashtags" && (
                <div className="space-y-2">
                  {results.hashtags.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No hashtags found</p>
                  ) : (
                    results.hashtags.map((h) => (
                      <Link key={h.tag} href={`/feed?category=${encodeURIComponent(h.tag)}`}>
                        <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-card hover:border-indigo-500/40 transition-all cursor-pointer group">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <Hash className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold group-hover:text-indigo-400 transition-colors">
                              #{h.tag}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {h.count} {h.count === 1 ? "debate" : "debates"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Default state — trending */
        <>
          {/* Trending hashtags */}
          {trendingHashtags.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-4 h-4 text-indigo-400" />
                <h2 className="font-semibold text-sm">Trending Hashtags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingHashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-border/60 text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Trending debates */}
          {trendingDebates.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <h2 className="font-semibold text-sm">Trending Debates</h2>
              </div>
              <div className="space-y-3">
                {trendingDebates.map((d) => {
                  const total = d.proVotes + d.conVotes;
                  const proPercent = total > 0 ? Math.round((d.proVotes / total) * 100) : 50;
                  return (
                    <Link key={d.id} href={`/debate/${d.id}`}>
                      <div className="flex items-start gap-3 p-4 rounded-2xl border border-border/60 bg-card hover:border-indigo-500/40 transition-all cursor-pointer group">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2 mb-1.5">
                            {d.title}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />{d.participantCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />{d.argCount}
                            </span>
                            <span className="text-blue-400 ml-auto">{proPercent}% YES</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {trendingHashtags.length === 0 && trendingDebates.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Search anything</p>
              <p className="text-sm mt-1">Find debates, people, or hashtags</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
