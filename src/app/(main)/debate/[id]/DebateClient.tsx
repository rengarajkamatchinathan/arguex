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
    <div className="flex items-center gap-4 mt-2">
      <button
        onClick={() => handleVote("UP")}
        disabled={pending}
        className={cn(
          "flex items-center gap-1 text-[12px] font-medium transition-colors",
          voted === "UP"
            ? "text-green-400"
            : "text-white/30 hover:text-green-400"
        )}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        <span>{counts.upvotes}</span>
      </button>
      <button
        onClick={() => handleVote("DOWN")}
        disabled={pending}
        className={cn(
          "flex items-center gap-1 text-[12px] font-medium transition-colors",
          voted === "DOWN"
            ? "text-red-400"
            : "text-white/30 hover:text-red-400"
        )}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
        <span>{counts.downvotes}</span>
      </button>
      <button
        onClick={() => handleVote("EVIDENCE")}
        disabled={pending}
        className={cn(
          "flex items-center gap-1 text-[12px] font-medium transition-colors",
          voted === "EVIDENCE"
            ? "text-amber-400"
            : "text-white/30 hover:text-amber-400"
        )}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>{counts.evidenceCount}</span>
      </button>
    </div>
  );
}

function ReplyCard({ arg }: { arg: ReplyType }) {
  const isPro = arg.side === "PRO";
  return (
    <div className="ml-10 pl-3 py-3 border-l border-white/8">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Avatar className="w-5 h-5">
          <AvatarFallback className="text-[9px] font-medium bg-white/6 text-white/30">
            {arg.author.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-[12px] font-medium text-white/40">@{arg.author.username}</span>
        <span className="text-white/15 text-[10px]">·</span>
        <span className="text-[11px] text-white/25">
          {timeAgo(new Date(arg.createdAt))}
        </span>
        <span
          className={cn(
            "text-[10px] font-bold ml-auto px-1.5 py-0.5 rounded",
            isPro
              ? "text-blue-400 bg-blue-500/10"
              : "text-orange-400 bg-orange-500/10"
          )}
        >
          {arg.side}
        </span>
      </div>
      <p className="text-[14px] text-white/85 leading-relaxed pl-7">
        {arg.content}
      </p>
      <div className="pl-8">
        <VoteButtons
          argumentId={arg.id}
          upvotes={arg.upvotes}
          downvotes={arg.downvotes}
          evidenceCount={arg.evidenceCount}
        />
      </div>
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
    <article className="flex gap-3 px-4 py-4 border-b border-white/5">
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        <Avatar className="w-7 h-7">
          <AvatarFallback className="text-[11px] font-medium bg-white/6 text-white/35">
            {arg.author.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header — keep it tiny, content is the star */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[12px] font-medium text-white/40">@{arg.author.username}</span>
          <span className="text-white/15 text-[10px]">·</span>
          <span className="text-[11px] text-white/25">
            {timeAgo(new Date(arg.createdAt))}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold ml-auto",
              isPro ? "text-blue-500/60" : "text-orange-500/60"
            )}
          >
            {isPro ? "PRO" : "CON"}
          </span>
        </div>

        {/* Body — this gets full attention */}
        <p className="text-[15px] leading-relaxed text-white/90 mb-2">
          {arg.content}
        </p>

        {/* Vote buttons */}
        <VoteButtons
          argumentId={arg.id}
          upvotes={arg.upvotes}
          downvotes={arg.downvotes}
          evidenceCount={arg.evidenceCount}
        />

        {/* Actions row */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="text-[12px] text-white/30 hover:text-white/70 flex items-center gap-1.5 transition-colors font-medium"
          >
            Reply
          </button>
          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-[12px] text-white/30 hover:text-white/70 flex items-center gap-1.5 transition-colors"
            >
              {showReplies ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>

        {/* Inline reply box */}
        {showReplyBox && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder="Write your counter-argument..."
              className="text-sm bg-white/5 border-white/10 resize-none rounded-xl focus:border-indigo-500/50 text-white placeholder:text-white/30"
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex items-center gap-2 justify-end">
              {replyError && (
                <p className="text-xs text-red-400 mr-auto">{replyError}</p>
              )}
              <button
                onClick={() => setShowReplyBox(false)}
                className="text-xs text-white/40 hover:text-white transition-colors px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handlePostReply}
                disabled={isSubmitting || replyText.trim().length < 3}
                className={cn(
                  "text-xs font-bold px-4 py-1.5 rounded-full transition-all",
                  "bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? "Posting..." : "Reply"}
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {showReplies && replies.length > 0 && (
          <div className="mt-2 space-y-0">
            {replies.map((reply) => (
              <ReplyCard key={reply.id} arg={reply} />
            ))}
          </div>
        )}
      </div>
    </article>
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

  const tags = (debate.tags.length > 0 ? debate.tags : [debate.category]);

  return (
    <div className="max-w-[680px] mx-auto">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 h-13.25 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <Link
          href="/feed"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 transition-colors text-white/50 hover:text-white shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="flex-1 font-bold text-[15px] text-white truncate min-w-0">
          {debate.title}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggleFollow}
            disabled={followPending}
            className={cn(
              "flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-full transition-all",
              following
                ? "bg-white/10 text-white/70 hover:bg-white/15"
                : "bg-white text-black hover:bg-white/90"
            )}
          >
            {following ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            {following ? "Saved" : "Save"}
          </button>
          <button className="flex items-center justify-center w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Debate header */}
      <div className="px-4 pt-5 pb-5 border-b border-white/5">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="w-6 h-6 shrink-0">
            <AvatarFallback className="text-[10px] font-medium bg-white/6 text-white/30">
              {debate.author.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-medium text-white/40">@{debate.author.username}</span>
            <span className="text-white/15 text-[10px]">·</span>
            <span className="text-[11px] text-white/25">
              {timeAgo(new Date(debate.createdAt))}
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto text-[12px] text-white/30">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {debate.participantCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {debate.argCount}
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-[22px] font-black leading-tight text-white mb-2">
          {debate.title}
        </h1>

        {/* Description */}
        {debate.description && (
          <p className="text-[14px] text-white/50 leading-relaxed mb-3">
            {debate.description}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-x-2 gap-y-1 mb-5">
          {tags.map((tag) => (
            <span key={tag} className="text-[12px] text-indigo-400 font-medium">
              #{tag}
            </span>
          ))}
        </div>

        {/* Community opinion — only shown when there are actual votes */}
        {total > 0 ? (
          <div className="mb-4">
            <p className="text-[11px] text-white/25 uppercase tracking-widest font-medium mb-2">
              Community Opinion
            </p>
            <div className="flex h-10 rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-center bg-linear-to-r from-blue-600 to-blue-500 transition-all duration-700"
                style={{ width: `${proPercent}%` }}
              >
                <span className="text-[15px] font-black text-white drop-shadow">
                  {proPercent}%
                </span>
              </div>
              <div
                className="flex items-center justify-center bg-orange-500 transition-all duration-700"
                style={{ width: `${conPercent}%` }}
              >
                <span className="text-[15px] font-black text-white drop-shadow">
                  {conPercent}%
                </span>
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-white/30 mt-1.5">
              <span>{proVoteSum} pro votes</span>
              <span>{conVoteSum} con votes</span>
            </div>
          </div>
        ) : (
          <div className="mb-4 px-3 py-2.5 rounded-xl border border-white/5 bg-white/2">
            <p className="text-[12px] text-white/25 text-center">
              Opinion forms as arguments get voted on
            </p>
          </div>
        )}

        {/* Add argument button */}
        <button
          onClick={() => setAddArgOpen(true)}
          className="w-full flex items-center justify-center gap-2 text-[14px] font-bold px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Your Argument
        </button>
      </div>

      {/* Arguments — desktop 2-col, mobile tabs */}
      <div className="hidden lg:grid lg:grid-cols-2 divide-x divide-white/5">
        {/* PRO column */}
        <div>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[13px] font-black text-blue-400 tracking-wide">PRO</span>
            <span className="ml-auto text-[11px] text-white/30">
              {proArgs.length} arguments
            </span>
          </div>
          <div>
            {proArgs.length === 0 ? (
              <div className="px-4 py-12 text-center text-white/30">
                <p className="text-[13px]">No PRO arguments yet.</p>
                <button
                  onClick={() => { setArgSide("PRO"); setAddArgOpen(true); }}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-[13px] font-bold transition-colors"
                >
                  Be the first &rarr;
                </button>
              </div>
            ) : (
              proArgs.map((arg) => (
                <ArgumentCard
                  key={arg.id}
                  arg={arg}
                  debateId={debate.id}
                  onReplyPosted={handleReplyPosted}
                />
              ))
            )}
          </div>
        </div>

        {/* CON column */}
        <div>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-[13px] font-black text-orange-400 tracking-wide">CON</span>
            <span className="ml-auto text-[11px] text-white/30">
              {conArgs.length} arguments
            </span>
          </div>
          <div>
            {conArgs.length === 0 ? (
              <div className="px-4 py-12 text-center text-white/30">
                <p className="text-[13px]">No CON arguments yet.</p>
                <button
                  onClick={() => { setArgSide("CON"); setAddArgOpen(true); }}
                  className="mt-2 text-orange-400 hover:text-orange-300 text-[13px] font-bold transition-colors"
                >
                  Be the first &rarr;
                </button>
              </div>
            ) : (
              conArgs.map((arg) => (
                <ArgumentCard
                  key={arg.id}
                  arg={arg}
                  debateId={debate.id}
                  onReplyPosted={handleReplyPosted}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="pro">
          <TabsList className="w-full h-auto p-0 bg-transparent border-b border-white/5 rounded-none gap-0">
            <TabsTrigger
              value="pro"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400 data-[state=active]:text-blue-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-[13px] font-black transition-colors text-white/30"
            >
              PRO&nbsp;<span className="text-xs opacity-60 font-normal">({proArgs.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="con"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-400 data-[state=active]:text-orange-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-[13px] font-black transition-colors text-white/30"
            >
              CON&nbsp;<span className="text-xs opacity-60 font-normal">({conArgs.length})</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pro" className="mt-0">
            {proArgs.length === 0 ? (
              <div className="px-4 py-12 text-center text-white/30">
                <p className="text-[13px] mb-2">No PRO arguments yet.</p>
                <button
                  onClick={() => { setArgSide("PRO"); setAddArgOpen(true); }}
                  className="text-blue-400 hover:text-blue-300 text-[13px] font-bold transition-colors"
                >
                  Be the first &rarr;
                </button>
              </div>
            ) : (
              proArgs.map((arg) => (
                <ArgumentCard
                  key={arg.id}
                  arg={arg}
                  debateId={debate.id}
                  onReplyPosted={handleReplyPosted}
                />
              ))
            )}
          </TabsContent>
          <TabsContent value="con" className="mt-0">
            {conArgs.length === 0 ? (
              <div className="px-4 py-12 text-center text-white/30">
                <p className="text-[13px] mb-2">No CON arguments yet.</p>
                <button
                  onClick={() => { setArgSide("CON"); setAddArgOpen(true); }}
                  className="text-orange-400 hover:text-orange-300 text-[13px] font-bold transition-colors"
                >
                  Be the first &rarr;
                </button>
              </div>
            ) : (
              conArgs.map((arg) => (
                <ArgumentCard
                  key={arg.id}
                  arg={arg}
                  debateId={debate.id}
                  onReplyPosted={handleReplyPosted}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Argument Dialog */}
      <Dialog open={addArgOpen} onOpenChange={setAddArgOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0a0a0a] border-white/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-black text-white">Add Your Argument</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {/* Side selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setArgSide("PRO")}
                className={cn(
                  "p-3.5 rounded-xl border text-sm font-bold transition-all text-left",
                  argSide === "PRO"
                    ? "border-blue-500/60 bg-blue-500/10 text-blue-400"
                    : "border-white/10 text-white/40 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  PRO
                </div>
                <div className="text-[11px] opacity-50 font-normal">Support the topic</div>
              </button>
              <button
                onClick={() => setArgSide("CON")}
                className={cn(
                  "p-3.5 rounded-xl border text-sm font-bold transition-all text-left",
                  argSide === "CON"
                    ? "border-orange-500/60 bg-orange-500/10 text-orange-400"
                    : "border-white/10 text-white/40 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  CON
                </div>
                <div className="text-[11px] opacity-50 font-normal">Oppose the topic</div>
              </button>
            </div>

            <Textarea
              placeholder="Make your case. Be specific, cite evidence, and stay respectful."
              className="min-h-[120px] resize-none bg-white/5 border-white/10 rounded-xl focus:border-indigo-500/60 text-[14px] text-white placeholder:text-white/25"
              value={argContent}
              onChange={(e) => setArgContent(e.target.value)}
            />

            {submitError && (
              <p className="text-xs text-red-400">{submitError}</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/25 tabular-nums">
                {argContent.length}/1000
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setAddArgOpen(false); setSubmitError(null); }}
                  className="text-sm text-white/40 hover:text-white transition-colors px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  disabled={argContent.trim().length < 10 || isPending}
                  onClick={handleSubmitArgument}
                  className={cn(
                    "text-sm font-bold text-white px-5 py-2 rounded-full transition-all",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    argSide === "PRO"
                      ? "bg-blue-600 hover:bg-blue-500"
                      : "bg-orange-600 hover:bg-orange-500"
                  )}
                >
                  {isPending ? "Posting..." : `Post ${argSide}`}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
