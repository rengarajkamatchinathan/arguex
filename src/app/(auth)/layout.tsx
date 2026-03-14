import { ArgueXLogo } from "@/components/arguex-logo";
import { Flame, Users, Swords } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — immersive branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Deep layered gradient */}
        <div className="absolute inset-0 bg-[#08050f]" />
        <div className="absolute inset-0 bg-linear-to-br from-indigo-950/80 via-transparent to-purple-950/50" />

        {/* Large blurred orbs */}
        <div className="absolute -top-32 -left-32 w-125 h-125 bg-indigo-600/12 rounded-full blur-[128px]" />
        <div className="absolute -bottom-48 -right-24 w-150 h-150 bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/3 w-75 h-75 bg-violet-500/6 rounded-full blur-[100px]" />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

        {/* Right edge fade */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-white/8 to-transparent" />

        <div className="relative flex flex-col items-center justify-center w-full px-16 z-10">
          {/* Logo — big, bold, centered */}
          <div className="relative mb-4">
            <div className="absolute -inset-6 bg-indigo-500/15 rounded-3xl blur-2xl" />
            <ArgueXLogo size={72} />
          </div>
          <h1 className="text-6xl font-black tracking-tight mb-2">
            <span className="bg-linear-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Argue
            </span>
            <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              X
            </span>
          </h1>
          <p className="text-white/30 text-sm font-medium tracking-[0.2em] uppercase mb-16">
            Where Ideas Compete
          </p>

          {/* Minimal feature pills */}
          <div className="flex flex-col gap-6 max-w-xs">
            {[
              {
                icon: <Swords className="w-5 h-5" />,
                text: "Pick a side. Make your case.",
                color: "text-indigo-400",
              },
              {
                icon: <Users className="w-5 h-5" />,
                text: "Community votes decide the winner.",
                color: "text-purple-400",
              },
              {
                icon: <Flame className="w-5 h-5" />,
                text: "Rise through the ranks.",
                color: "text-amber-400",
              },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-4">
                <div className={`${item.color} opacity-60`}>
                  {item.icon}
                </div>
                <span className="text-[15px] text-white/45 font-medium">
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom social proof */}
          <div className="absolute bottom-12 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-6 text-white/25 text-sm">
              <span className="font-bold text-white/50">10K+</span> debaters
              <span className="text-white/10">|</span>
              <span className="font-bold text-white/50">50K+</span> arguments
              <span className="text-white/10">|</span>
              <span className="font-bold text-white/50">2K+</span> debates
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 sm:px-12 py-10 relative">
        {/* Very subtle center glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.04)_0%,_transparent_60%)]" />

        {/* Mobile header */}
        <div className="lg:hidden flex flex-col items-center mb-12 relative z-10">
          <ArgueXLogo size={56} />
          <h1 className="text-3xl font-black mt-4 mb-1">
            <span className="text-white">Argue</span>
            <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">X</span>
          </h1>
          <p className="text-muted-foreground text-sm">Where ideas compete</p>
        </div>

        <div className="relative z-10 w-full max-w-100">
          {children}
        </div>

        <p className="relative z-10 mt-12 text-[11px] text-muted-foreground/40 tracking-wide">
          &copy; 2025 ArgueX
        </p>
      </div>
    </div>
  );
}
