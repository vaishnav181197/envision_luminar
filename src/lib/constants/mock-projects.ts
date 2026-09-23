import type { Project } from "@/types";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "FinFlow Dashboard",
    description:
      "A modern fintech dashboard with real-time analytics, transaction tracking, and intuitive data visualization for personal finance management.",
    demoUrl: "https://example.com/finflow",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
    author: { name: "Priya Sharma", batch: "2022–2026" },
    voteCount: 42,
    tags: ["Dashboard", "Fintech"],
    isWinner: true,
  },
  {
    id: "2",
    title: "Mindful Mobile App",
    description:
      "A calming meditation and wellness app with guided sessions, mood tracking, and personalized mindfulness journeys.",
    demoUrl: "https://example.com/mindful",
    thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop",
    author: { name: "Arjun Patel", batch: "2023–2027" },
    voteCount: 38,
    tags: ["Mobile", "Health"],
  },
  {
    id: "3",
    title: "DevConnect Platform",
    description:
      "Developer networking platform with project showcases, code snippets sharing, and collaborative workspace features.",
    demoUrl: "https://example.com/devconnect",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
    author: { name: "Sneha Reddy", batch: "2022–2026" },
    voteCount: 35,
    tags: ["Platform", "Social"],
  },
  {
    id: "4",
    title: "EcoTrack Sustainability",
    description:
      "Environmental impact tracker helping users monitor carbon footprint with actionable sustainability recommendations.",
    demoUrl: "https://example.com/ecotrack",
    author: { name: "Rahul Verma", batch: "2024–2028" },
    voteCount: 29,
    tags: ["Sustainability"],
  },
  {
    id: "5",
    title: "StudySync Learning Hub",
    description:
      "Collaborative study platform with flashcards, group sessions, progress analytics, and gamified learning paths.",
    demoUrl: "https://example.com/studysync",
    thumbnailUrl: "https://images.unsplash.com/photo-1501504905252-47336547f581?w=800&h=500&fit=crop",
    author: { name: "Ananya Iyer", batch: "2023–2027" },
    voteCount: 27,
    tags: ["Education", "Mobile"],
  },
  {
    id: "6",
    title: "Artisan Marketplace",
    description:
      "Curated marketplace for handmade goods featuring artisan profiles, custom order flows, and immersive product galleries.",
    demoUrl: "https://example.com/artisan",
    thumbnailUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop",
    author: { name: "Karan Mehta", batch: "2024–2028" },
    voteCount: 24,
    tags: ["E-commerce"],
  },
];

export const LEADERBOARD_DATA = MOCK_PROJECTS.map((p, i) => ({
  rank: i + 1,
  title: p.title,
  author: p.author?.name ?? "—",
  votes: p.voteCount,
  demoUrl: p.demoUrl,
}));
