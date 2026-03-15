"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  Home,
  Compass,
  PlusSquare,
  Bell,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/feed", icon: Home, label: "Home" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/debate/create", icon: PlusSquare, label: "Create" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
  { href: "/profile/me", icon: User, label: "Profile" },
];

function UserMenuDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const [dbUsername, setDbUsername] = useState<string | null>(null);
  const clerkUsername = user?.username ?? user?.firstName ?? "";
  const username = dbUsername ?? clerkUsername;
  const initials = (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "");

  useEffect(() => {
    if (!user) return;
    fetch("/api/users/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.user?.username) setDbUsername(data.user.username); })
      .catch(() => {});
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/6 transition-all duration-200 cursor-pointer w-full text-left outline-none">
          <div className="relative">
            <Avatar className="w-9 h-9 ring-2 ring-white/10 group-hover:ring-indigo-500/30 transition-all duration-200">
              <AvatarImage src={user?.imageUrl} alt={username} />
              <AvatarFallback className="text-xs font-semibold bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          <div className="hidden xl:flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold text-white truncate">
              @{username}
            </span>
            <span className="text-xs text-white/35 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
          <ChevronUp className="hidden xl:block w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-64 mb-2 p-1.5 rounded-xl border-white/10 bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/30">
        <div className="flex items-center gap-3 px-2.5 py-3">
          <Avatar className="w-10 h-10 ring-2 ring-white/10">
            <AvatarImage src={user?.imageUrl} alt={username} />
            <AvatarFallback className="text-sm font-semibold bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">
              @{username}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-white/6 my-1" />
        <DropdownMenuItem asChild>
          <Link href="/profile/me" className="cursor-pointer rounded-lg px-2.5 py-2.5 gap-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>View Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="cursor-pointer rounded-lg px-2.5 py-2.5 gap-3"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/6 my-1" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer rounded-lg px-2.5 py-2.5 gap-3 text-red-400 focus:text-red-400 focus:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[72px] xl:w-[245px] border-r border-white/5 bg-background z-40 py-6">
      {/* Logo */}
      <div className="px-4 xl:px-6 mb-8">
        <Link
          href="/feed"
          className="flex items-center gap-3 h-10 justify-center xl:justify-start"
        >
          {/* Collapsed: AX only */}
          <span className="xl:hidden text-[22px] font-black text-white tracking-tighter select-none">
            A<span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">X</span>
          </span>
          {/* Expanded: ArgueX */}
          <span className="hidden xl:block text-[22px] font-black text-white tracking-tighter select-none">
            Argue<span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">X</span>
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 xl:px-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href ||
            (href !== "/feed" && pathname.startsWith(href + "/"));
          const isCreate = href === "/debate/create";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-4 px-3 py-3 rounded-xl text-[15px] transition-all",
                "hover:bg-white/5",
                isActive ? "text-white font-bold" : "text-white/50 font-normal hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 transition-all",
                  isCreate ? "w-6 h-6" : "w-6 h-6",
                  isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"
                )}
              />
              <span className="hidden xl:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-2 xl:px-3 pt-4 border-t border-white/5">
        <UserMenuDropdown />
      </div>
    </aside>
  );
}

function TopBar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const username = user?.username ?? user?.firstName ?? "";
  const initials = (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "");

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-13.25 bg-background/90 backdrop-blur-md flex items-center justify-between px-4">
      {/* Logo centered */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <span className="text-[20px] font-black text-white tracking-tighter select-none">
          Argue<span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">X</span>
        </span>
      </div>
      {/* Right: User menu */}
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none">
              <div className="relative">
                <Avatar className="w-8 h-8 ring-2 ring-white/10">
                  <AvatarImage src={user?.imageUrl} alt={username} />
                  <AvatarFallback className="text-xs font-semibold bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300">
                    {initials || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-64 mt-2 p-1.5 rounded-xl border-white/10 bg-popover/95 backdrop-blur-xl shadow-xl shadow-black/30">
            <div className="flex items-center gap-3 px-2.5 py-3">
              <Avatar className="w-10 h-10 ring-2 ring-white/10">
                <AvatarImage src={user?.imageUrl} alt={username} />
                <AvatarFallback className="text-sm font-semibold bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-300">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  @{username}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-white/6 my-1" />
            <DropdownMenuItem asChild>
              <Link href="/profile/me" className="cursor-pointer rounded-lg px-2.5 py-2.5 gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>View Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="cursor-pointer rounded-lg px-2.5 py-2.5 gap-3"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/6 my-1" />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer rounded-lg px-2.5 py-2.5 gap-3 text-red-400 focus:text-red-400 focus:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-13.25 border-t border-white/5 bg-background/90 backdrop-blur-md">
      <div className="flex items-center justify-around h-full px-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href ||
            (href !== "/feed" && pathname.startsWith(href + "/"));
          const isCreate = href === "/debate/create";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-center flex-1 h-full transition-colors",
                isActive ? "text-white" : "text-white/40"
              )}
            >
              <Icon
                className={cn(
                  isCreate ? "w-7 h-7" : "w-[22px] h-[22px]",
                  isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"
                )}
              />
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarNav />
      <TopBar />
      <main className="lg:ml-[72px] xl:ml-[245px] pt-[53px] lg:pt-0 pb-[53px] lg:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
