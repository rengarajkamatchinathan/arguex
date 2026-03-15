export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

const ALL_BADGES: Badge[] = [
  { id: "first_debate", label: "Conversation Starter", emoji: "💬", description: "Created your first debate" },
  { id: "five_debates", label: "Topic Machine", emoji: "🔥", description: "Created 5 debates" },
  { id: "first_argument", label: "First Take", emoji: "✍️", description: "Posted your first argument" },
  { id: "ten_arguments", label: "Vocal", emoji: "📣", description: "Posted 10 arguments" },
  { id: "fifty_arguments", label: "Prolific", emoji: "🏆", description: "Posted 50 arguments" },
  { id: "ten_upvotes", label: "Crowd Favorite", emoji: "👏", description: "Received 10 upvotes" },
  { id: "hundred_upvotes", label: "Persuader", emoji: "🎯", description: "Received 100 upvotes" },
  { id: "rep_100", label: "Rising Star", emoji: "⭐", description: "Reached 100 reputation" },
  { id: "rep_500", label: "Advocate", emoji: "🛡️", description: "Reached 500 reputation" },
  { id: "rep_1000", label: "Expert", emoji: "💎", description: "Reached 1,000 reputation" },
];

export function computeBadges(stats: {
  debatesCreated: number;
  argumentsPosted: number;
  totalVotesReceived: number;
  reputationScore: number;
}): Badge[] {
  const earned: Badge[] = [];

  if (stats.debatesCreated >= 1) earned.push(ALL_BADGES.find(b => b.id === "first_debate")!);
  if (stats.debatesCreated >= 5) earned.push(ALL_BADGES.find(b => b.id === "five_debates")!);
  if (stats.argumentsPosted >= 1) earned.push(ALL_BADGES.find(b => b.id === "first_argument")!);
  if (stats.argumentsPosted >= 10) earned.push(ALL_BADGES.find(b => b.id === "ten_arguments")!);
  if (stats.argumentsPosted >= 50) earned.push(ALL_BADGES.find(b => b.id === "fifty_arguments")!);
  if (stats.totalVotesReceived >= 10) earned.push(ALL_BADGES.find(b => b.id === "ten_upvotes")!);
  if (stats.totalVotesReceived >= 100) earned.push(ALL_BADGES.find(b => b.id === "hundred_upvotes")!);
  if (stats.reputationScore >= 100) earned.push(ALL_BADGES.find(b => b.id === "rep_100")!);
  if (stats.reputationScore >= 500) earned.push(ALL_BADGES.find(b => b.id === "rep_500")!);
  if (stats.reputationScore >= 1000) earned.push(ALL_BADGES.find(b => b.id === "rep_1000")!);

  return earned;
}
