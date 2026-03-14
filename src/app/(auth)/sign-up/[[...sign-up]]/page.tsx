import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="w-full flex justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-transparent shadow-none border-none p-0 gap-6",
            headerTitle: "text-foreground font-black text-2xl tracking-tight",
            headerSubtitle: "text-muted-foreground/70 text-sm",
            socialButtonsBlockButton:
              "bg-white/[0.06] border-0 hover:bg-white/10 text-foreground rounded-full h-12 font-semibold text-sm transition-all duration-200",
            socialButtonsBlockButtonText: "font-semibold text-sm",
            socialButtonsProviderIcon: "w-5 h-5",
            dividerLine: "bg-white/[0.06]",
            dividerText: "text-muted-foreground/40 text-xs uppercase tracking-widest font-medium",
            formFieldLabel: "text-muted-foreground text-xs font-semibold uppercase tracking-wider",
            formFieldInput:
              "bg-white/[0.06] border-0 text-foreground placeholder:text-muted-foreground/40 rounded-xl h-12 text-sm px-4 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200",
            formButtonPrimary:
              "bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-full h-12 text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
            footerActionLink:
              "text-indigo-400 hover:text-indigo-300 font-semibold transition-colors",
            footerActionText: "text-muted-foreground/60 text-sm",
            footer: "mt-2",
            identityPreviewText: "text-foreground font-medium",
            identityPreviewEditButtonIcon: "text-indigo-400",
            formFieldAction: "text-indigo-400 hover:text-indigo-300 text-xs font-semibold",
            alertText: "text-foreground text-sm",
            formResendCodeLink: "text-indigo-400 hover:text-indigo-300 font-semibold",
            otpCodeFieldInput:
              "bg-white/[0.06] border-0 text-foreground rounded-xl h-12 text-lg font-bold focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/30",
            backLink: "text-muted-foreground hover:text-foreground text-sm",
          },
        }}
      />
    </div>
  );
}
