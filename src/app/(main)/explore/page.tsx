import Link from "next/link";
import { TrendingUp, Compass, Users, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mockDebates, trendingTopics } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/constants";

export default function ExplorePage() {
  const featuredDebates = mockDebates.slice(0, 6);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Compass className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-xl font-bold">Explore</h1>
      </div>

      {/* Trending Topics */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-orange-400" />
          <h2 className="font-semibold">Trending Topics</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <Badge
              key={topic.tag}
              variant="secondary"
              className="px-3 py-1.5 text-sm cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
            >
              #{topic.tag}
              <span className="ml-1.5 text-muted-foreground text-xs">{topic.count}</span>
            </Badge>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-8">
        <h2 className="font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat} href={`/feed?category=${cat}`}>
              <div className="p-4 rounded-xl border border-border/60 bg-card hover:border-indigo-500/40 hover:bg-card/80 transition-all text-center cursor-pointer group">
                <p className="text-sm font-medium group-hover:text-indigo-400 transition-colors">
                  {cat}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockDebates.filter((d) => d.category === cat).length} debates
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Debates */}
      <section>
        <h2 className="font-semibold mb-4">Featured Debates</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {featuredDebates.map((debate) => {
            const total = debate.proVotes + debate.conVotes;
            const proPercent =
              total > 0 ? Math.round((debate.proVotes / total) * 100) : 50;
            return (
              <Link key={debate.id} href={`/debate/${debate.id}`}>
                <div className="p-5 rounded-2xl border border-border/60 bg-card hover:border-indigo-500/40 transition-all cursor-pointer group h-full flex flex-col">
                  <div className="flex gap-2 mb-2">
                    <Badge className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      {debate.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-indigo-400 transition-colors flex-1">
                    {debate.title}
                  </h3>
                  <div className="mt-auto space-y-2">
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full"
                        style={{ width: `${proPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {debate.participantCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {debate.argCount}
                      </span>
                      <span className="text-blue-400">{proPercent}% YES</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
