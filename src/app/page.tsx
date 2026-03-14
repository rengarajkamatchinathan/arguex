import Link from "next/link";
import { ArrowRight, Flame, MessageSquare, Trophy, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockDebates } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/theme-toggle";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function VoteBar({ pro, con }: { pro: number; con: number }) {
  const total = pro + con;
  const proPercent = total > 0 ? Math.round((pro / total) * 100) : 50;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-blue-400 font-medium">{proPercent}% YES</span>
      <div className="flex-1 h-1.5 rounded-full bg-orange-900/40 overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full"
          style={{ width: `${proPercent}%` }}
        />
      </div>
      <span className="text-orange-400 font-medium">{100 - proPercent}% NO</span>
    </div>
  );
}

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/feed");

  const trendingDebates = mockDebates.slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ArgueX
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20">
            <Zap className="w-3 h-3 mr-1" /> The future of online debate
          </Badge>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6">
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Debate.
            </span>{" "}
            <span className="bg-linear-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Argue.
            </span>{" "}
            <span className="bg-linear-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Convince.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            ArgueX is the structured debate platform where ideas clash, evidence matters, and
            the best argument wins. Join thousands of thinkers debating the topics that matter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 h-12 rounded-xl shadow-lg shadow-indigo-500/25">
                Start Debating Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/feed">
              <Button variant="outline" size="lg" className="px-8 h-12 rounded-xl border-border/60">
                Explore Debates
              </Button>
            </Link>
          </div>
          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
            {[
              { value: "10K+", label: "Active Debaters" },
              { value: "50K+", label: "Arguments Posted" },
              { value: "2K+", label: "Open Debates" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How ArgueX Works</h2>
          <p className="text-muted-foreground text-center mb-12">
            Three simple steps to structured, evidence-based debate
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="w-6 h-6" />,
                step: "01",
                title: "Pick a Debate",
                description:
                  "Browse thousands of topics across technology, science, philosophy, economics and more. Filter by category or search for what interests you.",
                colorClass: "bg-indigo-500/10 text-indigo-400",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                step: "02",
                title: "Argue Your Side",
                description:
                  "Choose PRO or CON. Post structured arguments with evidence. Respond to opponents. Vote on the strongest points.",
                colorClass: "bg-purple-500/10 text-purple-400",
              },
              {
                icon: <Trophy className="w-6 h-6" />,
                step: "03",
                title: "Earn Reputation",
                description:
                  "Get upvoted for compelling arguments, earn reputation points, and climb the leaderboard. The best debaters rise to the top.",
                colorClass: "bg-amber-500/10 text-amber-400",
              },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl border border-border/60 bg-card/50 hover:border-border transition-all">
                <div className="text-5xl font-black text-border/30 absolute top-4 right-4">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${item.colorClass}`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Debates */}
      <section className="py-20 px-4 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-1">Trending Debates</h2>
              <p className="text-muted-foreground">The hottest discussions right now</p>
            </div>
            <Link href="/feed">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                View All <ArrowRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {trendingDebates.map((debate) => (
              <Link key={debate.id} href={`/debate/${debate.id}`}>
                <div className="p-5 rounded-2xl border border-border/60 bg-card/50 hover:border-indigo-500/40 hover:bg-card transition-all cursor-pointer group">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs bg-indigo-500/10 text-indigo-400 border-0">
                          {debate.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {debate.participantCount}
                        </span>
                      </div>
                      <h3 className="font-semibold group-hover:text-indigo-400 transition-colors leading-snug">
                        {debate.title}
                      </h3>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-400 transition-all group-hover:translate-x-1 shrink-0 mt-1" />
                  </div>
                  <VoteBar pro={debate.proVotes} con={debate.conVotes} />
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {debate.argCount} arguments
                    </span>
                    <span>by @{debate.author.username}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/feed">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                See All Debates <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 rounded-3xl bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20">
            <h2 className="text-3xl font-bold mb-4">Ready to change some minds?</h2>
            <p className="text-muted-foreground mb-8">
              Join ArgueX today. Your argument could be the one that shifts the debate.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-10 h-12 rounded-xl">
                Join ArgueX Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Flame className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">ArgueX</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 ArgueX. Where ideas compete.
          </p>
        </div>
      </footer>
    </div>
  );
}
