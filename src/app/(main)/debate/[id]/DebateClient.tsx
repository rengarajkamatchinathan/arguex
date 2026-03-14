"use client";

import { useState, useTransition, useEffect } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  MessageSquare,
  Users,
  ChevronDown,
  ChevronUp,
  Plus,
  ArrowLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, timeAgo } from "@/lib/utils";

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

interface ArgumentAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
}

interface ReplyType {
  id: string;
  debateId: string;
  authorId: string;
  author: ArgumentAuthor;
  content: string;
  side: "PRO" | "CON";
  parentId: string;
  upvotes: number;
  downvotes: number;
  evidenceCount: number;
  createdAt: string;
  replies: ReplyType[];
}

interface ArgumentType {
  id: string;
  debateId: string;
  authorId: string;
  author: ArgumentAuthor;
  content: string;
  side: "PRO" | "CON";
  parentId: string | null;
  upvotes: number;
  downvotes: number;
  evidenceCount: number;
  createdAt: string;
  replies?: ReplyType[];
}

function VoteButtons({
  argumentId,
  upvotes,
  downvotes,
  evidenceCount,
}: {
  argumentId: string;
  upvotes: number;
  downvotes: number;
  evidenceCount: number;
}) {
  const [voted, setVoted] = useState<"UP" | "DOWN" | "EVIDENCE" | null>(null);
  const [counts, setCounts] = useState({ upvotes, downvotes, evidenceCount });
  const [pending, setPending] = useState(false);

  async function handleVote(type: "UP" | "DOWN" | "EVIDENCE") {
    if (pending) return;
    setPending(true);
    const isToggleOff = voted === type;
    // Optimistic update
    setVoted(isToggleOff ? null : type);
    setCounts((prev) => {
      const delta = isToggleOff ? -1 : 1;
      if (type === "UP") return { ...prev, upvotes: prev.upvotes + delta };
      if (type === "DOWN") return { ...prev, downvotes: prev.downvotes + delta };
      return { ...prev, evidenceCount: prev.evidenceCount + delta };
    });
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ argumentId, voteType: type }),
      });
      if (!res.ok) {
        // Revert on error
        setVoted(isToggleOff ? type : null);
        setCounts((prev) => {
          const delta = isToggleOff ? 1 : -1;
          if (type === "UP") return { ...prev, upvotes: prev.upvotes + delta };
          if (type === "DOWN") return { ...prev, downvotes: prev.downvotes + delta };
          return { ...prev, evidenceCount: prev.evidenceCount + delta };
        });
      }
    } catch {
      setVoted(isToggleOff ? type : null);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <button
        onClick={() => handleVote("UP")}
        disabled={pending}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
          voted === "UP"
            ? "bg-green-500/10 text-green-400 border-green-500/30"
            : "text-muted-foreground border-border/60 hover:text-green-400 hover:border-green-500/30"
        )}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        Strong · {counts.upvotes}
      </button>
      <button
        onClick={() => handleVote("DOWN")}
        disabled={pending}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
          voted === "DOWN"
            ? "bg-red-500/10 text-red-400 border-red-500/30"
            : "text-muted-foreground border-border/60 hover:text-red-400 hover:border-red-500/30"
        )}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
        Weak · {counts.downvotes}
      </button>
      <button
        onClick={() => handleVote("EVIDENCE")}
        disabled={pending}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
          voted === "EVIDENCE"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
            : "text-muted-foreground border-border/60 hover:text-amber-400 hover:border-amber-500/30"
        )}
      >
        <BookOpen className="w-3.5 h-3.5" />
        Evidence · {counts.evidenceCount}
      </button>
    </div>
  );
}

function ReplyCard({ arg }: { arg: ReplyType }) {
  const isPro = arg.side === "PRO";
  return (
    <div
      className={cn(
        "ml-8 p-4 rounded-xl border text-sm",
        isPro
          ? "pro-card border-blue-500/20"
          : "con-card border-orange-500/20"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="w-5 h-5">
          <AvatarFallback
            className={cn(
              "text-[9px]",
              isPro
                ? "bg-blue-500/20 text-blue-400"
                : "bg-orange-500/20 text-orange-400"
            )}
          >
            {arg.author.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium">@{arg.author.username}</span>
        <span className="text-xs text-muted-foreground">
          {timeAgo(new Date(arg.createdAt))}
        </span>
        <Badge
          className={cn(
            "text-[10px] ml-auto",
            isPro
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-orange-500/10 text-orange-400 border-orange-500/20"
          )}
        >
          {arg.side}
        </Badge>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">{arg.content}</p>
      <VoteButtons
        argumentId={arg.id}
        upvotes={arg.upvotes}
        downvotes={arg.downvotes}
        evidenceCount={arg.evidenceCount}
      />
    </div>
  );
}

function ArgumentCard({
  arg,
  debateId,
  onReplyPosted,
}: {
  arg: ArgumentType;
  debateId: string;
  onReplyPosted: (reply: ArgumentType) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const isPro = arg.side === "PRO";
  const replies = arg.replies ?? [];

  async function handlePostReply() {
    if (replyText.trim().length < 3) return;
    setIsSubmitting(true);
    setReplyError(null);
    try {
      const res = await fetch("/api/arguments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debateId,
          content: replyText.trim(),
          side: arg.side === "PRO" ? "CON" : "PRO",
          parentId: arg.id,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setReplyError(err.error ?? "Failed to post reply");
        return;
      }
      const newReply = await res.json();
      onReplyPosted({ ...newReply, replies: [] });
      setReplyText("");
      setShowReplyBox(false);
      setShowReplies(true);
    } catch {
      setReplyError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={cn(
        "p-5 rounded-2xl border transition-all",
        isPro
          ? "pro-card border-blue-500/20 hover:border-blue-500/40"
          : "con-card border-orange-500/20 hover:border-orange-500/40"
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback
            className={cn(
              "text-xs",
              isPro
                ? "bg-blue-500/20 text-blue-400"
                : "bg-orange-500/20 text-orange-400"
            )}
          >
            {arg.author.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">@{arg.author.username}</span>
            <span className="text-xs text-muted-foreground">
              {timeAgo(new Date(arg.createdAt))}
            </span>
            <Badge
              className={cn(
                "text-[10px] ml-auto",
                isPro
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-orange-500/10 text-orange-400 border-orange-500/20"
              )}
            >
              {isPro ? "PRO" : "CON"}
            </Badge>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground/90 mb-2">{arg.content}</p>

      <VoteButtons
        argumentId={arg.id}
        upvotes={arg.upvotes}
        downvotes={arg.downvotes}
        evidenceCount={arg.evidenceCount}
      />

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/20">
        <button
          onClick={() => setShowReplyBox(!showReplyBox)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Reply
        </button>
        {replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors ml-auto"
          >
            {showReplies ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {showReplyBox && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="Write your reply..."
            className="text-sm bg-background/50 border-border/60 resize-none"
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowReplyBox(false)}>
              Cancel
            </Button>
            {replyError && <p className="text-xs text-red-400">{replyError}</p>}
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={handlePostReply}
              disabled={isSubmitting || replyText.trim().length < 3}
            >
              {isSubmitting ? "Posting..." : "Post Reply"}
            </Button>
          </div>
        </div>
      )}

      {showReplies && replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <ReplyCard key={reply.id} arg={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DebateClient({
  debate,
  initialArguments,
}: {
  debate: Debate;
  initialArguments: ArgumentType[];
}) {
  const [addArgOpen, setAddArgOpen] = useState(false);
  const [argSide, setArgSide] = useState<"PRO" | "CON">("PRO");
  const [argContent, setArgContent] = useState("");
  const [allArguments, setAllArguments] = useState<ArgumentType[]>(initialArguments);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followPending, setFollowPending] = useState(false);

  useEffect(() => {
    fetch(`/api/follows?debateId=${debate.id}`)
      .then((r) => r.json())
      .then((d) => setFollowing(d.following ?? false))
      .catch(() => {});
  }, [debate.id]);

  async function handleToggleFollow() {
    setFollowPending(true);
    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debateId: debate.id }),
      });
      const data = await res.json();
      setFollowing(data.following);
    } finally {
      setFollowPending(false);
    }
  }

  async function handleSubmitArgument() {
    if (argContent.trim().length < 10) return;
    setSubmitError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/arguments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            debateId: debate.id,
            content: argContent.trim(),
            side: argSide,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          setSubmitError(err.error ?? "Failed to post argument");
          return;
        }

        const newArg = await res.json();
        const argWithAuthor: ArgumentType = { ...newArg, replies: [] };
        setAllArguments((prev) => [...prev, argWithAuthor]);
        setAddArgOpen(false);
        setArgContent("");
      } catch {
        setSubmitError("Network error. Please try again.");
      }
    });
  }

  function handleReplyPosted(reply: ArgumentType) {
    setAllArguments((prev) => [...prev, reply]);
  }

  // Build nested structure: top-level args with their replies attached
  const topLevel = allArguments.filter((a) => !a.parentId);
  const replies = allArguments.filter((a) => a.parentId);
  const argsWithReplies: ArgumentType[] = topLevel.map((arg) => ({
    ...arg,
    replies: replies.filter((r) => r.parentId === arg.id) as ReplyType[],
  }));

  const proArgs = argsWithReplies.filter((a) => a.side === "PRO");
  const conArgs = argsWithReplies.filter((a) => a.side === "CON");

  const proVoteSum = allArguments
    .filter((a) => a.side === "PRO")
    .reduce((acc, a) => acc + a.upvotes, 0);
  const conVoteSum = allArguments
    .filter((a) => a.side === "CON")
    .reduce((acc, a) => acc + a.upvotes, 0);
  const total = proVoteSum + conVoteSum;
  const proPercent = total > 0 ? Math.round((proVoteSum / total) * 100) : 50;
  const conPercent = 100 - proPercent;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Feed
      </Link>

      {/* Debate Header */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                {debate.category}
              </Badge>
              {debate.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold leading-tight mb-3">
              {debate.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {debate.description}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={following ? "secondary" : "outline"}
              size="sm"
              className={cn(
                "gap-1.5 rounded-xl transition-all",
                following && "text-indigo-400 border-indigo-500/40"
              )}
              onClick={handleToggleFollow}
              disabled={followPending}
            >
              {following ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              {following ? "Following" : "Follow"}
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-5">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {debate.participantCount} participants
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {debate.argCount} arguments
          </span>
          <span>by @{debate.author.username}</span>
        </div>

        {/* Community Opinion */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Community Opinion
          </p>
          <div className="flex items-center gap-4 mb-2">
            <div className="text-center">
              <div className="text-2xl font-black text-blue-400">{proPercent}%</div>
              <div className="text-xs text-muted-foreground">YES</div>
            </div>
            <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${proPercent}%` }}
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-orange-400">{conPercent}%</div>
              <div className="text-xs text-muted-foreground">NO</div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{proVoteSum} pro votes</span>
            <span>{conVoteSum} con votes</span>
          </div>
        </div>
      </div>

      {/* Add Argument Button */}
      <div className="flex justify-end mb-5">
        <Button
          onClick={() => setAddArgOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Argument
        </Button>
      </div>

      {/* Arguments — desktop 2-col, mobile tabs */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-5">
        {/* PRO column */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <h2 className="font-bold text-blue-400">PRO Arguments</h2>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 ml-auto">
              {proArgs.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {proArgs.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-blue-500/20 text-center text-muted-foreground text-sm">
                No PRO arguments yet. Be the first!
              </div>
            ) : (
              proArgs.map((arg) => <ArgumentCard key={arg.id} arg={arg} debateId={debate.id} onReplyPosted={handleReplyPosted} />)
            )}
          </div>
        </div>
        {/* CON column */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <h2 className="font-bold text-orange-400">CON Arguments</h2>
            <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 ml-auto">
              {conArgs.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {conArgs.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-orange-500/20 text-center text-muted-foreground text-sm">
                No CON arguments yet. Be the first!
              </div>
            ) : (
              conArgs.map((arg) => <ArgumentCard key={arg.id} arg={arg} debateId={debate.id} onReplyPosted={handleReplyPosted} />)
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="pro">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="pro" className="flex-1 data-[state=active]:text-blue-400">
              PRO ({proArgs.length})
            </TabsTrigger>
            <TabsTrigger value="con" className="flex-1 data-[state=active]:text-orange-400">
              CON ({conArgs.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pro" className="space-y-4">
            {proArgs.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-blue-500/20 text-center text-muted-foreground text-sm">
                No PRO arguments yet.
              </div>
            ) : (
              proArgs.map((arg) => <ArgumentCard key={arg.id} arg={arg} debateId={debate.id} onReplyPosted={handleReplyPosted} />)
            )}
          </TabsContent>
          <TabsContent value="con" className="space-y-4">
            {conArgs.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-orange-500/20 text-center text-muted-foreground text-sm">
                No CON arguments yet.
              </div>
            ) : (
              conArgs.map((arg) => <ArgumentCard key={arg.id} arg={arg} debateId={debate.id} onReplyPosted={handleReplyPosted} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Argument Dialog */}
      <Dialog open={addArgOpen} onOpenChange={setAddArgOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border/60">
          <DialogHeader>
            <DialogTitle>Add Your Argument</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Side selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setArgSide("PRO")}
                className={cn(
                  "p-4 rounded-xl border text-sm font-semibold transition-all",
                  argSide === "PRO"
                    ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                    : "border-border/60 text-muted-foreground hover:border-blue-500/30"
                )}
              >
                PRO — Support
              </button>
              <button
                onClick={() => setArgSide("CON")}
                className={cn(
                  "p-4 rounded-xl border text-sm font-semibold transition-all",
                  argSide === "CON"
                    ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                    : "border-border/60 text-muted-foreground hover:border-orange-500/30"
                )}
              >
                CON — Oppose
              </button>
            </div>
            <Textarea
              placeholder="Make your case. Be specific, cite evidence, and stay respectful."
              className="min-h-32 resize-none bg-background border-border/60"
              value={argContent}
              onChange={(e) => setArgContent(e.target.value)}
            />
            {submitError && (
              <p className="text-xs text-red-400">{submitError}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {argContent.length}/1000 characters
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setAddArgOpen(false); setSubmitError(null); }}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    "text-white",
                    argSide === "PRO"
                      ? "bg-blue-600 hover:bg-blue-500"
                      : "bg-orange-600 hover:bg-orange-500"
                  )}
                  disabled={argContent.trim().length < 10 || isPending}
                  onClick={handleSubmitArgument}
                >
                  {isPending ? "Posting..." : `Post ${argSide} Argument`}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
