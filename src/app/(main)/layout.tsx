"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Flame,
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
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 border-r border-border/40 bg-background/95 backdrop-blur z-40 px-4 py-6">
      <Link href="/feed" className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Flame className="w-4 h-4 text-white" />
        </div>
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

      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
        <ThemeToggle />
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border/40 bg-background/95 backdrop-blur flex items-center justify-between px-4">
      <Link href="/feed" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Flame className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-lg font-black bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ArgueX
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserButton
          appearance={{
            elements: { avatarBox: "w-7 h-7" },
          }}
        />
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
