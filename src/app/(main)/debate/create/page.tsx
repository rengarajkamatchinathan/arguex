"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Hash, ImagePlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/lib/upload";

export default function CreateDebatePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashInput, setHashInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"title" | "details">("title");
  const [images, setImages] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const user = session?.user;
  const username = user?.username ?? user?.name ?? "you";

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setSuggestions(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (step === "title") titleRef.current?.focus();
    if (step === "details") inputRef.current?.focus();
  }, [step]);

  const filteredSuggestions = hashInput.trim()
    ? suggestions.filter(
        (s) => s.toLowerCase().includes(hashInput.toLowerCase()) && !hashtags.includes(s)
      )
    : suggestions.filter((s) => !hashtags.includes(s)).slice(0, 8);

  function addHashtag(value: string) {
    const tag = value.trim().toLowerCase().replace(/\s+/g, "-").replace(/^#+/, "");
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags((prev) => [...prev, tag]);
    }
    setHashInput("");
    inputRef.current?.focus();
  }

  function removeHashtag(tag: string) {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === "," || e.key === " ") && hashInput.trim()) {
      e.preventDefault();
      addHashtag(hashInput);
    }
    if (e.key === "Backspace" && !hashInput && hashtags.length > 0) {
      setHashtags((prev) => prev.slice(0, -1));
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const remaining = 4 - images.length;
    const toUpload = files.slice(0, remaining);
    setImageUploading(true);
    try {
      const urls = await Promise.all(
        toUpload.map((f) => uploadToCloudinary(f, "debates"))
      );
      setImages((prev) => [...prev, ...urls]);
    } catch {
      // silently fail individual uploads
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/debates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category: hashtags[0],
          description,
          tags: hashtags,
          images,
        }),
      });
      if (res.ok) router.push("/feed");
    } catch {
      //
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleValid = title.trim().length >= 10;
  const isValid = titleValid && hashtags.length > 0 && description.trim().length >= 20;

  return (
    <div className="max-w-150 mx-auto min-h-screen flex flex-col">
      {/* Top bar — like Twitter compose */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 h-13.25 border-b border-white/5 bg-background/90 backdrop-blur-md">
        <Link
          href="/feed"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors text-white/60 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <span className="text-[15px] font-bold text-white">New Debate</span>

        <button
          onClick={step === "title" ? () => { if (titleValid) setStep("details"); } : handleSubmit}
          disabled={step === "title" ? !titleValid : !isValid || isSubmitting}
          className={cn(
            "px-4 py-1.5 rounded-full text-[13px] font-bold transition-all",
            (step === "title" ? titleValid : isValid && !isSubmitting)
              ? "bg-indigo-500 hover:bg-indigo-400 text-white"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
        >
          {step === "title" ? "Next" : isSubmitting ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Compose area */}
      <div className="flex-1 px-4 pt-4">
        {step === "title" ? (
          /* Step 1: Write the debate question */
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 shrink-0 mt-0.5">
              <AvatarFallback className="text-sm font-semibold bg-indigo-500/20 text-indigo-300">
                {username[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-1">
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's the debate? Ask a clear yes/no question..."
                maxLength={200}
                rows={4}
                className="w-full bg-transparent text-[18px] font-medium text-white placeholder:text-white/25 outline-none resize-none leading-relaxed"
              />
              {title.length > 0 && (
                <p className="text-[12px] text-white/30 mt-1">
                  {200 - title.length} characters left
                </p>
              )}

              {/* Hint */}
              <div className="mt-6 p-3 rounded-xl bg-white/3 border border-white/5">
                <p className="text-[12px] text-white/40 leading-relaxed">
                  💡 Best debates are clear yes/no questions —{" "}
                  <span className="text-white/60 italic">&quot;Should AI replace doctors?&quot;</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Add details + hashtags */
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 shrink-0 mt-0.5">
              <AvatarFallback className="text-sm font-semibold bg-indigo-500/20 text-indigo-300">
                {username[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-1 space-y-4">

              {/* Show title as a "quoted tweet" preview */}
              <div className="px-3 py-2.5 rounded-xl border border-white/8 bg-white/3">
                <p className="text-[14px] font-semibold text-white leading-snug">{title}</p>
              </div>

              {/* Description */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context... what makes this debate interesting?"
                maxLength={1000}
                rows={3}
                className="w-full bg-transparent text-[15px] text-white/80 placeholder:text-white/25 outline-none resize-none leading-relaxed"
              />

              {/* Image upload */}
              <div>
                {images.length > 0 && (
                  <div className={cn(
                    "grid gap-1.5 mb-3 rounded-xl overflow-hidden",
                    images.length === 1 && "grid-cols-1",
                    images.length === 2 && "grid-cols-2",
                    images.length >= 3 && "grid-cols-2"
                  )}>
                    {images.map((url, i) => (
                      <div key={i} className="relative group aspect-video bg-white/5">
                        <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {images.length < 4 && (
                  <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/30 hover:bg-white/2 cursor-pointer transition-all">
                    {imageUploading ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    ) : (
                      <ImagePlus className="w-4 h-4 text-white/30" />
                    )}
                    <span className="text-[13px] text-white/30">
                      {imageUploading ? "Uploading..." : `Add images (${images.length}/4)`}
                    </span>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                  </label>
                )}
              </div>

              {/* Hashtag input */}
              <div>
                <div
                  className="flex flex-wrap gap-1.5 items-center min-h-10 px-3 py-2 rounded-xl border border-white/8 bg-white/3 focus-within:border-indigo-500/40 cursor-text transition-colors"
                  onClick={() => inputRef.current?.focus()}
                >
                  <Hash className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  {hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 text-[12px] font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeHashtag(tag); }}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {hashtags.length < 10 && (
                    <input
                      ref={inputRef}
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value.replace(/^#+/, ""))}
                      onKeyDown={handleKeyDown}
                      placeholder={hashtags.length === 0 ? "Add topics..." : ""}
                      className="flex-1 min-w-20 bg-transparent outline-none text-[14px] text-white placeholder:text-white/25"
                    />
                  )}
                </div>

                {/* Suggestions */}
                {filteredSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => addHashtag(s)}
                        className="px-2.5 py-1 rounded-full text-[11px] border border-white/8 text-white/40 hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                      >
                        #{s}
                      </button>
                    ))}
                  </div>
                )}

                {hashInput.trim() && (
                  <p className="text-[11px] text-indigo-400 mt-1.5 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Press Enter to add &quot;#{hashInput.trim()}&quot;
                  </p>
                )}
              </div>

              {/* Validation hints */}
              <div className="flex items-center gap-4 text-[11px] text-white/25 pb-4">
                <span className={cn(description.length >= 20 && "text-green-400/60")}>
                  {description.length}/1000
                </span>
                <span className={cn(hashtags.length > 0 && "text-green-400/60")}>
                  {hashtags.length}/10 tags
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1.5 py-4">
        <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", step === "title" ? "bg-indigo-400" : "bg-white/20")} />
        <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", step === "details" ? "bg-indigo-400" : "bg-white/20")} />
      </div>
    </div>
  );
}
