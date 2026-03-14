import { Flame } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ArgueX
          </span>
        </Link>
      </div>
      {children}
      <p className="mt-8 text-xs text-muted-foreground">
        © 2024 ArgueX — Where ideas compete.
      </p>
    </div>
  );
}
