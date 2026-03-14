import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="w-full flex justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "bg-card border border-border/60 shadow-2xl rounded-2xl",
            headerTitle: "text-foreground font-bold",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton:
              "border border-border/60 bg-card hover:bg-muted text-foreground",
            formFieldInput:
              "bg-input border border-border/60 text-foreground placeholder:text-muted-foreground rounded-lg",
            formButtonPrimary:
              "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg",
            footerActionLink: "text-indigo-400 hover:text-indigo-300",
          },
        }}
      />
    </div>
  );
}
