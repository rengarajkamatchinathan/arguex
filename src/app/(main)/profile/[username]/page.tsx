"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquare,
  ThumbsUp,
  Trophy,
  Calendar,
  ArrowLeft,
  Edit3,
  Flame,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getReputationLevel } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  reputationScore: number;
  createdAt: string;
}

interface Debate {
  id: string;
  title: string;
  category: string;
  argCount: number;
  createdAt: string;
}

interface Argument {
  id: string;
  content: string;
  side: "PRO" | "CON";
  upvotes: number;
  createdAt: string;
}

interface ProfileData {
  user: UserProfile;
  stats: {
    debatesCreated: number;
    argumentsPosted: number;
    totalVotesReceived: number;
  };
  recentDebates: Debate[];
  recentArguments: Argument[];
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: clerkUser } = useUser();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`/api/users/${username}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then((json) => { if (json) setData(json); })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 animate-pulse">
        <div className="h-36 rounded-2xl bg-muted" />
        <div className="h-6 w-40 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <p className="text-lg font-semibold mb-2">User not found</p>
        <p className="text-sm mb-6">@{username} doesn't exist on ArgueX yet.</p>
        <Link href="/feed">
          <Button variant="outline">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  const { user, stats, recentDebates, recentArguments } = data;
  const level = getReputationLevel(user.reputationScore);
  const isOwnProfile = clerkUser?.username === username ||
    clerkUser?.emailAddresses?.[0]?.emailAddress === user.email;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Cover + Avatar */}
      <div className="relative mb-16">
        <div className="h-36 rounded-2xl bg-linear-to-br from-indigo-600/30 via-purple-600/20 to-pink-600/10 border border-border/40" />
        <div className="absolute -bottom-12 left-6 flex items-end gap-4">
          <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
            <AvatarFallback className="text-3xl font-bold bg-linear-to-br from-indigo-500 to-purple-600 text-white">
              {user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        {isOwnProfile && (
          <div className="absolute -bottom-10 right-4">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="px-2 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold">@{user.username}</h1>
          <Badge
            className={cn(
              "text-xs border",
              level.color === "text-amber-400"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : level.color === "text-purple-400"
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
            )}
          >
            {level.label}
          </Badge>
        </div>
        {user.bio && (
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {user.bio}
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          Joined {timeAgo(new Date(user.createdAt))}
        </div>
      </div>

      {/* Reputation */}
      <div className="p-4 rounded-2xl border border-border/60 bg-card mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-semibold text-sm">Reputation Score</span>
          </div>
          <span className="text-2xl font-black text-foreground">
            {user.reputationScore.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full"
            style={{ width: `${Math.min((user.reputationScore / 10000) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span className={level.color}>{level.label}</span>
          <span>Next: {level.max === Infinity ? "Max level" : `${level.max + 1} pts`}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: <Trophy className="w-4 h-4" />, value: stats.debatesCreated, label: "Debates Created" },
          { icon: <MessageSquare className="w-4 h-4" />, value: stats.argumentsPosted, label: "Arguments Posted" },
          { icon: <ThumbsUp className="w-4 h-4" />, value: stats.totalVotesReceived, label: "Total Upvotes" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl border border-border/60 bg-card text-center">
            <div className="flex justify-center mb-2 text-indigo-400">{stat.icon}</div>
            <div className="text-2xl font-black">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{stat.label}</div>
          </div>
        ))}
      </div>

      <Separator className="mb-6" />

      {/* Tabs */}
      <Tabs defaultValue="arguments">
        <TabsList className="w-full mb-5">
          <TabsTrigger value="arguments" className="flex-1">
            Arguments ({stats.argumentsPosted})
          </TabsTrigger>
          <TabsTrigger value="debates" className="flex-1">
            Debates ({stats.debatesCreated})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arguments" className="space-y-4">
          {recentArguments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No arguments posted yet</p>
            </div>
          ) : (
            recentArguments.map((arg) => (
              <div
                key={arg.id}
                className={cn(
                  "p-4 rounded-xl border text-sm",
                  arg.side === "PRO"
                    ? "pro-card border-blue-500/20"
                    : "con-card border-orange-500/20"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={cn(
                      "text-xs",
                      arg.side === "PRO"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    )}
                  >
                    {arg.side}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(new Date(arg.createdAt))}
                  </span>
                  <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <ThumbsUp className="w-3 h-3" />
                    {arg.upvotes}
                  </div>
                </div>
                <p className="text-foreground/90 leading-relaxed line-clamp-3">{arg.content}</p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="debates" className="space-y-4">
          {recentDebates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No debates created yet</p>
            </div>
          ) : (
            recentDebates.map((debate) => (
              <Link key={debate.id} href={`/debate/${debate.id}`}>
                <div className="p-4 rounded-xl border border-border/60 bg-card hover:border-indigo-500/40 transition-all cursor-pointer">
                  <div className="flex gap-2 mb-2">
                    <Badge className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      {debate.category}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm leading-snug mb-2">{debate.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {debate.argCount} arguments
                    </span>
                    <span>{timeAgo(new Date(debate.createdAt))}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
