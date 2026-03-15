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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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

  const tabCounts: Record<Tab, number> = {
    debates: results?.debates.length ?? 0,
    users: results?.users.length ?? 0,
    hashtags: results?.hashtags.length ?? 0,
  };

  return (
    <div className="max-w-150 mx-auto">
      {/* Sticky search header */}
      <div className="sticky top-0 z-20 px-4 py-3 border-b border-border/30 bg-background/90 backdrop-blur-md">
        <div className="relative">
          <Search
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
              query ? "text-indigo-400" : "text-muted-foreground"
            )}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search debates, people, #topics..."
            className={cn(
              "w-full pl-11 pr-10 py-2.5 rounded-full text-[14px]",
              "bg-muted/50 border border-transparent",
              "placeholder:text-muted-foreground/50 text-foreground",
              "focus:outline-none focus:bg-background focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20",
              "transition-all duration-200"
            )}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-foreground" />
            </button>
          )}
        </div>
      </div>

      {query.trim() ? (
        /* Search results view */
        <>
          {/* Tabs — underline style */}
          <div className="flex border-b border-border/30">
            {(["debates", "users", "hashtags"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-3.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px",
                  activeTab === tab
                    ? "border-indigo-400 text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
                {results && (
                  <span className="ml-1.5 text-xs opacity-50">
                    ({tabCounts[tab]})
                  </span>
                )}
              </button>
            ))}
          </div>

          {searching ? (
            <div className="space-y-0">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3.5 border-b border-border/20 animate-pulse"
                >
                  <div className="w-9 h-9 rounded-full bg-muted shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : !results || totalResults === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Search className="w-9 h-9 opacity-20" />
              <div className="text-center">
                <p className="font-medium text-foreground">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-sm mt-1">Try different keywords or check the spelling.</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "debates" && (
                <div>
                  {results.debates.length === 0 ? (
                    <p className="text-[14px] text-muted-foreground text-center py-12">
                      No debates match &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    results.debates.map((d) => {
                      const total = d.proVotes + d.conVotes;
                      const proPercent = total > 0 ? Math.round((d.proVotes / total) * 100) : 50;
                      const tags = (d.tags.length > 0 ? d.tags : [d.category]).slice(0, 3);
                      return (
                        <Link key={d.id} href={`/debate/${d.id}`}>
                          <article className="flex items-start gap-3 px-4 py-3.5 border-b border-border/20 hover:bg-muted/10 transition-colors cursor-pointer group">
                            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <MessageSquare className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold text-foreground group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2 mb-1">
                                {d.title}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {tags.map((tag) => (
                                  <span key={tag} className="text-[11px] text-indigo-400/70 font-medium">
                                    #{tag}
                                  </span>
                                ))}
                                <span className="text-[11px] text-muted-foreground">
                                  · {d.argCount} args
                                </span>
                                <span className="text-[11px] text-blue-400 ml-auto">
                                  {proPercent}% yes
                                </span>
                              </div>
                            </div>
                          </article>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "users" && (
                <div>
                  {results.users.length === 0 ? (
                    <p className="text-[14px] text-muted-foreground text-center py-12">
                      No users match &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    results.users.map((u) => {
                      const level = getReputationLevel(u.reputationScore);
                      return (
                        <Link key={u.id} href={`/profile/${u.username}`}>
                          <article className="flex items-center gap-3 px-4 py-3.5 border-b border-border/20 hover:bg-muted/10 transition-colors cursor-pointer group">
                            <Avatar className="w-10 h-10 shrink-0">
                              {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.username} />}
                              <AvatarFallback className="font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                                {u.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-[14px] font-semibold group-hover:text-indigo-300 transition-colors">
                                  @{u.username}
                                </p>
                                <span className={cn("text-[11px] font-medium", level.color)}>
                                  {level.label}
                                </span>
                              </div>
                              {u.bio && (
                                <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">
                                  {u.bio}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-orange-400 shrink-0">
                              <Flame className="w-3.5 h-3.5" />
                              <span className="text-[12px] font-semibold tabular-nums">
                                {u.reputationScore}
                              </span>
                            </div>
                          </article>
                        </Link>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "hashtags" && (
                <div>
                  {results.hashtags.length === 0 ? (
                    <p className="text-[14px] text-muted-foreground text-center py-12">
                      No hashtags match &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    results.hashtags.map((h) => (
                      <Link key={h.tag} href={`/feed?category=${encodeURIComponent(h.tag)}`}>
                        <article className="flex items-center gap-3 px-4 py-3.5 border-b border-border/20 hover:bg-muted/10 transition-colors cursor-pointer group">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <Hash className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold group-hover:text-indigo-300 transition-colors">
                              #{h.tag}
                            </p>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                              {h.count} {h.count === 1 ? "debate" : "debates"}
                            </p>
                          </div>
                        </article>
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
            <section className="px-4 pt-5 pb-4 border-b border-border/20">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-indigo-400" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
                  Trending Topics
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingHashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[12px] font-medium",
                      "border border-border/50 text-muted-foreground",
                      "hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/5",
                      "transition-all"
                    )}
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
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/20">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <h2 className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
                  Trending Debates
                </h2>
              </div>
              <div>
                {trendingDebates.map((d) => {
                  const total = d.proVotes + d.conVotes;
                  const proPercent = total > 0 ? Math.round((d.proVotes / total) * 100) : 50;
                  return (
                    <Link key={d.id} href={`/debate/${d.id}`}>
                      <article className="flex items-start gap-3 px-4 py-3.5 border-b border-border/20 hover:bg-muted/10 transition-colors cursor-pointer group">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <MessageSquare className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-foreground group-hover:text-indigo-300 transition-colors leading-snug line-clamp-2 mb-1.5">
                            {d.title}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {d.participantCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {d.argCount}
                            </span>
                            <span className="text-blue-400 font-medium ml-auto">
                              {proPercent}% YES
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {trendingHashtags.length === 0 && trendingDebates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
              <Search className="w-10 h-10 opacity-20" />
              <div className="text-center">
                <p className="font-medium text-foreground">Search anything</p>
                <p className="text-sm mt-1">Find debates, people, or hashtags</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
