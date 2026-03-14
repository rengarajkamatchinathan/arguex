import Link from "next/link";
import { ArgueXLogo } from "@/components/arguex-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <ArgueXLogo size={36} />
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
