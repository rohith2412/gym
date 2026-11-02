import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const APP_STORE_URL =
  "https://apps.apple.com/nz/app/pocketgym-ai-fitness-tracker/id6765536420";

export const metadata = {
  title: "Blog — Fitness, Nutrition & Training Guides",
  description:
    "Practical fitness and nutrition articles. No fluff — just stuff that works. From protein intake to workout splits, written for people who actually go to the gym.",
  alternates: {
    canonical: "https://www.yourpocketgym.com/v1/blog",
  },
  openGraph: {
    title: "Blog — Fitness, Nutrition & Training Guides | YourPocketGym",
    description:
      "Practical fitness and nutrition articles. No fluff — just stuff that works.",
    url: "https://www.yourpocketgym.com/v1/blog",
    siteName: "YourPocketGym",
    type: "website",
  },
};

const POSTS = [
  {
    slug: "protein-intake-guide",
    title: "How Much Protein Do You Actually Need?",
    desc: "The real numbers, not bro-science. What the research says and how to hit your target without choking down six chicken breasts a day.",
    date: "Oct 2026",
  },
  {
    slug: "calorie-deficit-tips",
    title: "How to Cut Calories Without Wanting to Quit",
    desc: "A calorie deficit doesn't have to feel like punishment. Small swaps, volume eating, and knowing when to take a break.",
    date: "Oct 2026",
  },
  {
    slug: "beginner-gym-mistakes",
    title: "5 Gym Mistakes That Are Costing You Gains",
    desc: "Program hopping, skipping food, ego lifting — the stuff nobody tells you until you've wasted six months.",
    date: "Sep 2026",
  },
  {
    slug: "easy-meal-prep",
    title: "Meal Prep for People Who Hate Cooking",
    desc: "You don't need Pinterest recipes. Two proteins, two carbs, one pan. Sunday sorted in under an hour.",
    date: "Sep 2026",
  },
  {
    slug: "scale-weight-fluctuations",
    title: "Why Your Scale Weight Jumped 3 Pounds Overnight",
    desc: "You didn't gain 3 lbs of fat. Here's what actually happened and why weekly averages matter more.",
    date: "Aug 2026",
  },
  {
    slug: "cardio-vs-lifting",
    title: "Cardio vs Lifting: Which One Actually Burns More Fat?",
    desc: "The answer isn't what most people think. Why weights win long-term and where cardio still matters.",
    date: "Aug 2026",
  },
  {
    slug: "read-nutrition-labels",
    title: "How to Read a Nutrition Label in 10 Seconds",
    desc: "Serving sizes are designed to trick you. Here's what to actually look at and what to ignore.",
    date: "Jul 2026",
  },
  {
    slug: "lean-bulk-guide",
    title: "How to Gain Muscle Without Getting Fat",
    desc: "Lean bulking isn't complicated — small surplus, enough protein, hard training. Here's the playbook.",
    date: "Jul 2026",
  },
  {
    slug: "tracking-macros-guide",
    title: "The No-Nonsense Guide to Tracking Macros",
    desc: "You don't need to weigh every grain of rice. How to track well enough to see results without losing your mind.",
    date: "Jun 2026",
  },
  {
    slug: "best-workout-split",
    title: "The Best Workout Split (Hint: It's the One You'll Do)",
    desc: "PPL, upper/lower, full body — none of it matters if you skip Thursday. How to pick the split that fits your life.",
    date: "Jun 2026",
  },
];

export default function BlogIndex() {
  return (
    <div
      className={jakarta.className}
      style={{
        background: "#fafaf8",
        minHeight: "100dvh",
        maxWidth: 680,
        margin: "0 auto",
        padding: "0 1.25rem 4rem",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 0 2rem",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "-0.035em",
              color: "#1a1a1a",
            }}
          >
            Your<span style={{ color: "#ff6b35" }}>Pocket</span>Gym
          </span>
        </Link>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#ff6b35",
            textDecoration: "none",
            padding: "0.4rem 1rem",
            border: "1px solid rgba(255,107,53,0.3)",
            borderRadius: 99,
          }}
        >
          Get the app →
        </a>
      </nav>

      <h1
        style={{
          fontSize: "clamp(28px, 6vw, 40px)",
          fontWeight: 800,
          color: "#1a1a1a",
          letterSpacing: "-0.04em",
          lineHeight: 1.15,
          marginBottom: "0.5rem",
        }}
      >
        Blog
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "#888",
          lineHeight: 1.6,
          marginBottom: "2.5rem",
        }}
      >
        Practical fitness and nutrition guides. No fluff.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/v1/blog/${post.slug}`}
            style={{
              textDecoration: "none",
              background: "#fff",
              border: "1px solid #e8e5de",
              borderRadius: 20,
              padding: "1.5rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              transition: "box-shadow 150ms ease",
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "#bbb",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {post.date}
            </p>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#1a1a1a",
                letterSpacing: "-0.03em",
                marginBottom: 6,
                lineHeight: 1.3,
              }}
            >
              {post.title}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#888",
                lineHeight: 1.6,
              }}
            >
              {post.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
