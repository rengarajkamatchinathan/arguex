"use client";

import { useState } from "react";
import {
  Bell,
  ThumbsUp,
  MessageSquare,
  AtSign,
  Users,
  Flame,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockNotifications } from "@/lib/mock-data";
import { cn, timeAgo } from "@/lib/utils";

const notificationIcons: Record<string, React.ReactNode> = {
  VOTE: <ThumbsUp className="w-4 h-4 text-green-400" />,
  REPLY: <MessageSquare className="w-4 h-4 text-blue-400" />,
  MENTION: <AtSign className="w-4 h-4 text-purple-400" />,
  FOLLOW: <Users className="w-4 h-4 text-indigo-400" />,
  DEBATE_REPLY: <Flame className="w-4 h-4 text-orange-400" />,
};

const notificationColors: Record<string, string> = {
  VOTE: "bg-green-500/10 border-green-500/20",
  REPLY: "bg-blue-500/10 border-blue-500/20",
  MENTION: "bg-purple-500/10 border-purple-500/20",
  FOLLOW: "bg-indigo-500/10 border-indigo-500/20",
  DEBATE_REPLY: "bg-orange-500/10 border-orange-500/20",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm mt-1">
            We&apos;ll notify you when something happens
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markRead(notif.id)}
              className={cn(
                "flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all",
                notif.read
                  ? "bg-card border-border/40 opacity-70 hover:opacity-100"
                  : "bg-card border-border/60 hover:border-indigo-500/30"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5",
                  notificationColors[notif.type] ?? "bg-muted border-border/40"
                )}
              >
                {notificationIcons[notif.type] ?? (
                  <Bell className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm leading-snug",
                    notif.read ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {notif.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {timeAgo(notif.createdAt)}
                </p>
              </div>

              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && unreadCount === 0 && (
        <p className="text-center text-xs text-muted-foreground mt-8">
          You&apos;re all caught up!
        </p>
      )}
    </div>
  );
}
