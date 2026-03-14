"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Plus, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function CreateDebatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/debates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, description, tags }),
      });
      if (res.ok) {
        router.push("/feed");
      }
    } catch {
      // handle error silently in demo
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = title.trim().length >= 10 && category && description.trim().length >= 20;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/feed"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
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

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Category <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                    category === cat
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                      : "text-muted-foreground border-border/60 hover:text-foreground hover:border-border"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
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

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tags{" "}
              <span className="text-muted-foreground font-normal">(up to 5)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                className="bg-muted/30 border-border/60 rounded-xl"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 5}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1 pl-2 text-xs"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Link href="/feed" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl">
                Cancel
              </Button>
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
              {category && (
                <Badge className="mb-3 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  {category}
                </Badge>
              )}
              <h3 className="font-bold text-lg leading-snug mb-3">
                {title || (
                  <span className="text-muted-foreground italic">
                    Your debate title will appear here...
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {description || (
                  <span className="italic">Your description will appear here...</span>
                )}
              </p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
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
