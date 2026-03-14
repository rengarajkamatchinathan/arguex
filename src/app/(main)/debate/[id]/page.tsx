import { notFound } from "next/navigation";
import { headers } from "next/headers";
import DebateClient from "./DebateClient";

interface DebateAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
  reputationScore: number;
}

interface Debate {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  authorId: string;
  participantCount: number;
  argCount: number;
  proVotes: number;
  conVotes: number;
  createdAt: string;
  updatedAt: string;
  author: DebateAuthor;
}

interface ArgumentAuthor {
  id: string;
  username: string;
  avatarUrl: string | null;
}

interface Argument {
  id: string;
  debateId: string;
  authorId: string;
  content: string;
  side: "PRO" | "CON";
  parentId: string | null;
  upvotes: number;
  downvotes: number;
  evidenceCount: number;
  createdAt: string;
  author: ArgumentAuthor;
}

export default async function DebatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  let debate: Debate;
  let args: Argument[];

  try {
    const res = await fetch(`${protocol}://${host}/api/debates/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      notFound();
    }

    const data = await res.json();
    debate = data.debate;
    args = data.arguments ?? [];
  } catch {
    notFound();
  }

  return <DebateClient debate={debate} initialArguments={args} />;
}
