"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Eye, Hash } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CreateDebatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashInput, setHashInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setSuggestions(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const filteredSuggestions = hashInput.trim()
    ? suggestions.filter(
        (s) =>
          s.toLowerCase().includes(hashInput.toLowerCase()) &&
          !hashtags.includes(s)
      )
    : suggestions.filter((s) => !hashtags.includes(s));

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

  const handleSubmit = async () => {
    if (!title.trim() || hashtags.length === 0 || !description.trim()) return;
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
        }),
      });
      if (res.ok) router.push("/feed");
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    title.trim().length >= 10 &&
    hashtags.length > 0 &&
    description.trim().length >= 20;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/feed" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Create a Debate</h1>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Eye className="w-4 h-4" />
          {showPreview ? "Hide" : "Preview"}
        </button>
      </div>

      <div className={cn("grid gap-6", showPreview ? "lg:grid-cols-2" : "max-w-2xl")}>
        {/* Form */}
        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Debate Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Should AI be regulated like nuclear technology?"
              className="bg-muted/30 border-border/60 rounded-xl h-12"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Phrase as a clear yes/no question</span>
              <span>{title.length}/200</span>
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Hashtags <span className="text-destructive">*</span>
              </Label>
              <span className="text-xs text-muted-foreground">{hashtags.length}/10</span>
            </div>

            {/* Tag input box */}
            <div
              className="min-h-11 flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-xl border border-border/60 bg-muted/30 cursor-text focus-within:border-indigo-500/50 transition-colors"
              onClick={() => inputRef.current?.focus()}
            >
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium"
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
                  placeholder={hashtags.length === 0 ? "#technology, #ai, #startup..." : ""}
                  className="flex-1 min-w-24 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
                />
              )}
            </div>

            {/* Suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {filteredSuggestions.slice(0, 12).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addHashtag(s)}
                    className="px-2.5 py-1 rounded-full text-xs border border-border/60 text-muted-foreground hover:text-indigo-400 hover:border-indigo-500/30 transition-all"
                  >
                    #{s}
                  </button>
                ))}
              </div>
            )}

            {hashInput.trim() && !suggestions.some(
              (s) => s.toLowerCase() === hashInput.trim().toLowerCase()
            ) && (
              <p className="text-xs text-indigo-400 flex items-center gap-1">
                <Hash className="w-3 h-3" />
                Press Enter to create &quot;#{hashInput.trim()}&quot;
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Press Enter, comma, or space to add. First hashtag becomes the primary category.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Provide context, background, and the key points of contention. What makes this debate interesting?"
              className="bg-muted/30 border-border/60 rounded-xl resize-none min-h-36"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum 20 characters</span>
              <span>{description.length}/1000</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Link href="/feed" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl">Cancel</Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
            >
              {isSubmitting ? "Creating..." : "Create Debate"}
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Preview
            </p>
            <div className="p-5 rounded-2xl border border-border/60 bg-card">
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hashtags.map((tag) => (
                    <Badge key={tag} className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              <h3 className="font-bold text-lg leading-snug mb-3">
                {title || (
                  <span className="text-muted-foreground italic">Your debate title will appear here...</span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {description || <span className="italic">Your description will appear here...</span>}
              </p>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                <p className="text-xs text-muted-foreground text-center">
                  Community opinion bar will appear after votes
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
