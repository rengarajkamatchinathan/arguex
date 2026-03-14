"use client";

import Link from "next/link";
import { ArgueXLogo } from "@/components/arguex-logo";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Home,
  Compass,
  PlusSquare,
  Bell,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/debate/create", icon: PlusSquare, label: "Create" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile/me", icon: User, label: "Profile" },
];

function SidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const username = user?.username ?? user?.firstName ?? "";

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 border-r border-border/40 bg-background/95 backdrop-blur z-40 px-4 py-6">
      <Link href="/feed" className="flex items-center gap-2.5 mb-10 px-2">
        <ArgueXLogo size={32} />
        <span className="text-xl font-black bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ArgueX
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 pt-4 border-t border-border/40">
        <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
        <Link href="/profile/me" className="flex-1 min-w-0 group">
          <p className="text-sm font-semibold truncate group-hover:text-indigo-400 transition-colors">@{username}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</p>
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}

function TopBar() {
  const { user } = useUser();
  const username = user?.username ?? user?.firstName ?? "";

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border/40 bg-background/95 backdrop-blur flex items-center justify-between px-4">
      <Link href="/feed" className="flex items-center gap-2">
        <ArgueXLogo size={28} />
        <span className="text-lg font-black bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ArgueX
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          {username && (
            <span className="text-sm font-semibold text-foreground">@{username}</span>
          )}
          <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all",
                isActive ? "text-indigo-400" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarNav />
      <TopBar />
      <main className="lg:pl-60 pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
