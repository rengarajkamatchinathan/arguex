"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquare,
  ThumbsUp,
  Trophy,
  Calendar,
  ArrowLeft,
  Flame,
  Camera,
  Search,
  X,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getReputationLevel } from "@/lib/constants";
import { cn, timeAgo } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/upload";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
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
    followersCount: number;
    followingCount: number;
  };
  isFollowing: boolean;
  recentDebates: Debate[];
  recentArguments: Argument[];
}

interface FollowUser {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  reputationScore: number;
}

type ActiveTab = "arguments" | "debates" | "saved";
type FollowModalTab = "followers" | "following";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: clerkUser } = useUser();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("debates");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Followers/Following modal state
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<FollowModalTab>("followers");
  const [followList, setFollowList] = useState<FollowUser[]>([]);
  const [followListLoading, setFollowListLoading] = useState(false);
  const [followSearch, setFollowSearch] = useState("");
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());

  // Saved debates state
  const [savedDebates, setSavedDebates] = useState<Debate[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedLoaded, setSavedLoaded] = useState(false);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    setSaveError("");
    try {
      const url = await uploadToCloudinary(file, "avatars");
      setEditBannerUrl(url);
    } catch {
      setSaveError("Failed to upload banner");
    } finally {
      setBannerUploading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setSaveError("");
    try {
      const url = await uploadToCloudinary(file, "avatars");
      setEditAvatarUrl(url);
    } catch {
      setSaveError("Failed to upload image");
    } finally {
      setAvatarUploading(false);
    }
  };

  const openEdit = () => {
    setEditUsername(data?.user.username ?? "");
    setEditBio(data?.user.bio ?? "");
    setEditAvatarUrl(data?.user.avatarUrl ?? "");
    setEditBannerUrl(data?.user.bannerUrl ?? "");
    setSaveError("");
    setEditOpen(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: editUsername, bio: editBio, avatarUrl: editAvatarUrl, bannerUrl: editBannerUrl }),
      });
      const json = await res.json();
      if (!res.ok) { setSaveError(json.error ?? "Failed to save"); return; }
      setData((prev) => prev ? { ...prev, user: { ...prev.user, ...json } } : prev);
      setEditOpen(false);
      // Redirect if username changed
      if (json.username && json.username !== username) {
        router.replace(`/profile/${json.username}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFollow = async () => {
    if (followLoading || !data) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`/api/users/${data.user.username}/follow`, { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setIsFollowing(json.following);
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            stats: {
              ...prev.stats,
              followersCount: prev.stats.followersCount + (json.following ? 1 : -1),
            },
          };
        });
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const openFollowModal = useCallback((tab: FollowModalTab) => {
    setFollowModalTab(tab);
    setFollowSearch("");
    setFollowModalOpen(true);
  }, []);

  // Load follow list when modal opens or tab changes
  useEffect(() => {
    if (!followModalOpen || !data) return;
    setFollowListLoading(true);
    fetch(`/api/users/${data.user.username}/${followModalTab}`)
      .then((r) => r.json())
      .then((list) => {
        setFollowList(Array.isArray(list) ? list : []);
      })
      .catch(() => setFollowList([]))
      .finally(() => setFollowListLoading(false));
  }, [followModalOpen, followModalTab, data]);

  // Load who the current user follows (for follow buttons in modal)
  useEffect(() => {
    if (!followModalOpen || !clerkUser) return;
    fetch(`/api/users/me`)
      .then((r) => r.json())
      .then((meData) => {
        if (meData?.user?.username) {
          fetch(`/api/users/${meData.user.username}/following`)
            .then((r) => r.json())
            .then((list) => {
              if (Array.isArray(list)) {
                setFollowingSet(new Set(list.map((u: FollowUser) => u.id)));
              }
            });
        }
      });
  }, [followModalOpen, clerkUser]);

  const toggleFollowInModal = async (targetUsername: string, targetId: string) => {
    const res = await fetch(`/api/users/${targetUsername}/follow`, { method: "POST" });
    const json = await res.json();
    if (res.ok) {
      setFollowingSet((prev) => {
        const next = new Set(prev);
        if (json.following) next.add(targetId);
        else next.delete(targetId);
        return next;
      });
    }
  };

  const filteredFollowList = followSearch
    ? followList.filter((u) => u.username.toLowerCase().includes(followSearch.toLowerCase()))
    : followList;

  // Load saved debates when tab is selected
  useEffect(() => {
    const ownProfile = clerkUser?.username === username;
    if (activeTab !== "saved" || savedLoaded || !ownProfile) return;
    setSavedLoading(true);
    fetch("/api/debates?saved=true")
      .then((r) => r.json())
      .then((json) => {
        setSavedDebates(json.debates ?? []);
        setSavedLoaded(true);
      })
      .catch(() => {})
      .finally(() => setSavedLoading(false));
  }, [activeTab, savedLoaded, clerkUser, username]);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`/api/users/${username}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); return null; }
        return res.json();
      })
      .then((json) => {
        if (json) {
          setData(json);
          setIsFollowing(json.isFollowing ?? false);
        }
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-150 mx-auto animate-pulse">
        <div className="h-50 bg-white/5" />
        <div className="px-4 pb-4">
          <div className="relative -mt-11 mb-4">
            <div className="w-22 h-22 rounded-full bg-white/10 border-[3px] border-background" />
          </div>
          <div className="h-5 w-36 rounded bg-white/10 mb-2" />
          <div className="h-4 w-56 rounded bg-white/10 mb-4" />
          <div className="flex gap-6">
            <div className="h-4 w-16 rounded bg-white/10" />
            <div className="h-4 w-16 rounded bg-white/10" />
            <div className="h-4 w-16 rounded bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="max-w-150 mx-auto px-4 py-20 text-center text-white/40">
        <p className="text-lg font-bold text-white mb-2">User not found</p>
        <p className="text-sm mb-6">@{username} doesn&apos;t exist on ArgueX yet.</p>
        <Link
          href="/feed"
          className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          &larr; Back to Feed
        </Link>
      </div>
    );
  }

  const { user, stats, recentDebates, recentArguments } = data;
  const level = getReputationLevel(user.reputationScore);
  const isOwnProfile =
    username === "me" ||
    clerkUser?.username === username ||
    clerkUser?.username === user.username ||
    clerkUser?.emailAddresses?.[0]?.emailAddress === user.email;

  return (
    <div className="max-w-150 mx-auto">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-4 px-4 h-13.25 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <Link
          href="/feed"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/5 transition-colors text-white/50 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-[15px] leading-tight text-white truncate">{user.username}</span>
          <span className="text-[11px] text-white/30 leading-tight">
            {stats.debatesCreated} debates
          </span>
        </div>
      </div>

      {/* Cover banner */}
      <div className="relative h-50 overflow-hidden group/banner">
        {user.bannerUrl ? (
          <img src={user.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, hsl(243 75% 8%) 0%, hsl(265 68% 6%) 50%, hsl(222 84% 4%) 100%)"
              }}
            />
            <div className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(ellipse at 25% 60%, hsl(243 75% 59% / 0.15) 0%, transparent 55%),
                                  radial-gradient(ellipse at 75% 30%, hsl(265 68% 57% / 0.10) 0%, transparent 45%)`
              }}
            />
          </>
        )}
        {isOwnProfile && (
          <button
            onClick={openEdit}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center"
          >
            <Camera className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Avatar + action row */}
      <div className="px-4">
        <div className="relative flex items-end justify-between -mt-11 mb-4">
          <div className="relative group">
            <Avatar className="w-22 h-22 border-[3px] border-background shadow-xl">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.username} />}
              <AvatarFallback className="text-[32px] font-black bg-linear-to-br from-indigo-500 to-purple-600 text-white">
                {user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <button
                onClick={openEdit}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Follow / Edit button */}
          {isOwnProfile ? (
            <button
              onClick={openEdit}
              className="text-[14px] font-bold text-white border border-white/30 px-5 py-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={cn(
                "text-[14px] font-bold px-5 py-1.5 rounded-full transition-all",
                isFollowing
                  ? "text-white border border-white/30 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                  : "text-black bg-white hover:bg-white/90"
              )}
            >
              {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {/* Username & level */}
        <div className="mb-1 flex items-center gap-2 flex-wrap">
          <h1 className="text-[19px] font-black text-white">{user.username}</h1>
          <span
            className={cn(
              "text-[11px] font-bold px-2 py-0.5 rounded-full",
              level.color === "text-amber-400"
                ? "bg-amber-500/10 text-amber-400"
                : level.color === "text-purple-400"
                ? "bg-purple-500/10 text-purple-400"
                : level.color === "text-orange-400"
                ? "bg-orange-500/10 text-orange-400"
                : "bg-indigo-500/10 text-indigo-400"
            )}
          >
            {level.label}
          </span>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-[14px] text-white/70 leading-relaxed mb-2">
            {user.bio}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-[12px] text-white/30 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Joined {timeAgo(new Date(user.createdAt))}
          </span>
          <span className="flex items-center gap-1 text-orange-400">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-bold">{user.reputationScore.toLocaleString()}</span>
            <span className="text-white/30">rep</span>
          </span>
        </div>

        {/* Stats row — Instagram style: Posts | Followers | Following */}
        <div className="flex items-stretch border-y border-white/5 py-3 mb-0">
          <button
            onClick={() => openFollowModal("followers")}
            className="flex-1 text-center hover:bg-white/3 transition-colors"
          >
            <div className="text-[20px] font-black text-white tabular-nums">
              {stats.followersCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-white/30 mt-0.5">Followers</div>
          </button>
          <div className="w-px bg-white/5" />
          <button
            onClick={() => openFollowModal("following")}
            className="flex-1 text-center hover:bg-white/3 transition-colors"
          >
            <div className="text-[20px] font-black text-white tabular-nums">
              {stats.followingCount.toLocaleString()}
            </div>
            <div className="text-[11px] text-white/30 mt-0.5">Following</div>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(isOwnProfile
          ? ([
              { key: "debates" as ActiveTab, label: "Debates", count: stats.debatesCreated },
              { key: "arguments" as ActiveTab, label: "Arguments", count: stats.argumentsPosted },
              { key: "saved" as ActiveTab, label: "Saved", count: savedDebates.length },
            ])
          : ([
              { key: "debates" as ActiveTab, label: "Debates", count: stats.debatesCreated },
              { key: "arguments" as ActiveTab, label: "Arguments", count: stats.argumentsPosted },
            ])
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 py-3.5 text-[12px] font-black uppercase tracking-widest transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-white text-white"
                : "border-transparent text-white/25 hover:text-white/60"
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-[10px] font-normal opacity-50">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "arguments" && (
          <>
            {recentArguments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/25 gap-2">
                <MessageSquare className="w-9 h-9 opacity-20" />
                <p className="text-[14px]">No arguments posted yet</p>
              </div>
            ) : (
              recentArguments.map((arg) => {
                const isPro = arg.side === "PRO";
                return (
                  <article
                    key={arg.id}
                    className={cn(
                      "px-4 py-4 border-b border-white/5",
                      isPro ? "debate-pro" : "debate-con"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded",
                          isPro
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-orange-500/10 text-orange-400"
                        )}
                      >
                        {arg.side}
                      </span>
                      <span className="text-[11px] text-white/30">
                        {timeAgo(new Date(arg.createdAt))}
                      </span>
                      <div className="ml-auto flex items-center gap-1 text-[11px] text-white/30">
                        <ThumbsUp className="w-3 h-3" />
                        {arg.upvotes}
                      </div>
                    </div>
                    <p className="text-[14px] text-white/80 leading-relaxed line-clamp-3">
                      {arg.content}
                    </p>
                  </article>
                );
              })
            )}
          </>
        )}

        {activeTab === "debates" && (
          <>
            {recentDebates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/25 gap-2">
                <Trophy className="w-9 h-9 opacity-20" />
                <p className="text-[14px]">No debates created yet</p>
              </div>
            ) : (
              recentDebates.map((debate) => (
                <Link key={debate.id} href={`/debate/${debate.id}`}>
                  <article className="px-4 py-4 border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer group">
                    <div className="mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-400">
                        #{debate.category}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold leading-snug text-white group-hover:text-indigo-300 transition-colors mb-2 line-clamp-2">
                      {debate.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-white/30">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {debate.argCount} arguments
                      </span>
                      <span>{timeAgo(new Date(debate.createdAt))}</span>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </>
        )}

        {activeTab === "saved" && isOwnProfile && (
          <>
            {savedLoading ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin mx-auto" />
              </div>
            ) : savedDebates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/25 gap-2">
                <Bookmark className="w-9 h-9 opacity-20" />
                <p className="text-[14px]">No saved debates yet</p>
                <p className="text-[12px] text-white/15">Bookmark debates to see them here</p>
              </div>
            ) : (
              savedDebates.map((debate) => (
                <Link key={debate.id} href={`/debate/${debate.id}`}>
                  <article className="px-4 py-4 border-b border-white/5 hover:bg-white/2 transition-colors cursor-pointer group">
                    <div className="mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-400">
                        #{debate.category}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-bold leading-snug text-white group-hover:text-indigo-300 transition-colors mb-2 line-clamp-2">
                      {debate.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-white/30">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {debate.argCount} arguments
                      </span>
                      <span>{timeAgo(new Date(debate.createdAt))}</span>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[17px] font-black text-white">Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Banner upload */}
            <div>
              <Label className="text-xs text-white/40 mb-1.5 block">Banner</Label>
              <label className="relative block h-28 rounded-xl overflow-hidden cursor-pointer group border border-white/10">
                {editBannerUrl ? (
                  <img src={editBannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-indigo-900/30 to-purple-900/30" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {bannerUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-white" />
                      <span className="text-[12px] text-white font-medium">Change banner</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                  disabled={bannerUploading}
                />
              </label>
            </div>

            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-2">
              <label className="relative cursor-pointer group">
                <Avatar className="w-20 h-20 border-2 border-white/10">
                  {editAvatarUrl && <AvatarImage src={editAvatarUrl} alt="preview" />}
                  <AvatarFallback className="text-2xl font-black bg-linear-to-br from-indigo-500 to-purple-600 text-white">
                    {user.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {avatarUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
              </label>
              <p className="text-[11px] text-white/30">
                {avatarUploading ? "Uploading..." : "Click to change photo"}
              </p>
            </div>

            {/* Username */}
            <div>
              <Label className="text-xs text-white/40 mb-1.5 block">
                Username
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">
                  @
                </span>
                <Input
                  placeholder="username"
                  value={editUsername}
                  onChange={(e) =>
                    setEditUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                    )
                  }
                  className="pl-7 rounded-xl text-sm border-white/10 bg-white/5 text-white placeholder:text-white/25"
                  maxLength={30}
                />
              </div>
              <p className="text-[11px] text-white/25 mt-1">
                Letters, numbers, underscores only. Min 3 chars.
              </p>
            </div>

            {/* Bio */}
            <div>
              <Label className="text-xs text-white/40 mb-1.5 block">
                Bio
              </Label>
              <Textarea
                placeholder="Tell us about yourself..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                maxLength={160}
                className="rounded-xl text-sm resize-none border-white/10 bg-white/5 text-white placeholder:text-white/25"
              />
              <p className="text-[11px] text-white/25 mt-1 text-right tabular-nums">
                {editBio.length}/160
              </p>
            </div>

            {saveError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {saveError}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-white/15 text-sm font-bold text-white/50 hover:text-white hover:border-white/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex-1 py-2.5 rounded-full bg-white text-black text-sm font-black transition-colors disabled:opacity-50 hover:bg-white/90"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Followers / Following Modal */}
      <Dialog open={followModalOpen} onOpenChange={setFollowModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10 rounded-2xl p-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/8">
            {(["followers", "following"] as FollowModalTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFollowModalTab(tab)}
                className={cn(
                  "flex-1 py-3.5 text-[13px] font-bold transition-colors border-b-2 -mb-px capitalize",
                  followModalTab === tab
                    ? "border-white text-white"
                    : "border-transparent text-white/30 hover:text-white/60"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="px-4 pt-2 pb-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                value={followSearch}
                onChange={(e) => setFollowSearch(e.target.value)}
                placeholder="Search"
                className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors"
              />
              {followSearch && (
                <button
                  onClick={() => setFollowSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* User list */}
          <div className="max-h-96 overflow-y-auto">
            {followListLoading ? (
              <div className="py-12 text-center">
                <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredFollowList.length === 0 ? (
              <div className="py-12 text-center text-white/25 text-[13px]">
                {followSearch ? "No users found" : `No ${followModalTab} yet`}
              </div>
            ) : (
              filteredFollowList.map((u) => {
                const isMe = clerkUser?.username === u.username || clerkUser?.emailAddresses?.[0]?.emailAddress === u.username;
                const amFollowing = followingSet.has(u.id);
                return (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/3 transition-colors">
                    <Link
                      href={`/profile/${u.username}`}
                      onClick={() => setFollowModalOpen(false)}
                      className="shrink-0"
                    >
                      <Avatar className="w-10 h-10">
                        {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.username} />}
                        <AvatarFallback className="text-[13px] font-semibold bg-white/6 text-white/40">
                          {u.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/profile/${u.username}`}
                        onClick={() => setFollowModalOpen(false)}
                        className="block"
                      >
                        <p className="text-[14px] font-semibold text-white truncate hover:text-indigo-300 transition-colors">
                          {u.username}
                        </p>
                        {u.bio && (
                          <p className="text-[12px] text-white/35 truncate">{u.bio}</p>
                        )}
                      </Link>
                    </div>
                    {!isMe && (
                      <button
                        onClick={() => toggleFollowInModal(u.username, u.id)}
                        className={cn(
                          "shrink-0 text-[12px] font-bold px-4 py-1.5 rounded-full transition-all",
                          amFollowing
                            ? "text-white/70 border border-white/20 hover:border-red-500/50 hover:text-red-400"
                            : "text-white bg-indigo-500 hover:bg-indigo-400"
                        )}
                      >
                        {amFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
