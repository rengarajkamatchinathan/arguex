import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { debates } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/feed");
  }

  // Fetch trending debates for the preview
  const trendingDebates = await db
    .select({
      id: debates.id,
      title: debates.title,
      category: debates.category,
      argCount: debates.argCount,
      participantCount: debates.participantCount,
    })
    .from(debates)
    .orderBy(desc(debates.argCount))
    .limit(5);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-[20px] font-black text-white tracking-tight">
            Argue<span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">X</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-[14px] font-bold text-white/60 hover:text-white transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="text-[14px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors px-5 py-2 rounded-full"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center mb-16 mt-20">
          <h1 className="text-[48px] sm:text-[60px] font-black text-white leading-tight mb-6">
            Debate ideas,{" "}
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
              not egos.
            </span>
          </h1>
          <p className="text-[18px] text-white/50 leading-relaxed mb-10 max-w-lg mx-auto">
            ArgueX is a structured debate platform where arguments are organized,
            voted on, and ranked — so the best ideas rise to the top.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="text-[16px] font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors px-8 py-3.5 rounded-full"
            >
              Join the debate
            </Link>
            <Link
              href="/sign-in"
              className="text-[16px] font-bold text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-colors px-8 py-3.5 rounded-full"
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Trending debates preview */}
        {trendingDebates.length > 0 && (
          <div className="w-full max-w-xl mb-20">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-4 text-center">
              Trending Debates
            </h2>
            <div className="rounded-2xl border border-white/8 bg-white/2 overflow-hidden divide-y divide-white/5">
              {trendingDebates.map((d) => (
                <div
                  key={d.id}
                  className="px-5 py-4 hover:bg-white/3 transition-colors"
                >
                  <p className="text-[14px] font-bold text-white leading-snug mb-1.5">
                    {d.title}
                  </p>
                  <div className="flex items-center gap-3 text-[12px] text-white/30">
                    <span className="text-indigo-400 font-medium">#{d.category}</span>
                    <span>{d.argCount} arguments</span>
                    <span>{d.participantCount} debating</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-[13px] text-white/25 mt-4">
              Sign up to join these debates and share your perspective.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <p className="text-center text-[12px] text-white/20">
          ArgueX — Structured debates for better thinking.
        </p>
      </footer>
    </div>
  );
}
