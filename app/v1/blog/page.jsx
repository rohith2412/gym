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
    slug: "body-recomposition",
    title: "Can You Lose Fat and Build Muscle at the Same Time?",
    date: "Nov 2026",
  },
  {
    slug: "creatine-guide",
    title: "Creatine: The Only Supplement Worth Your Money",
    date: "Nov 2026",
  },
  {
    slug: "eating-out-on-a-diet",
    title: "How to Eat at Restaurants Without Blowing Your Diet",
    date: "Nov 2026",
  },
  {
    slug: "rest-day-guide",
    title: "What to Actually Do on Rest Days",
    date: "Nov 2026",
  },
  {
    slug: "breaking-plateaus",
    title: "Your Lifts Stopped Going Up. Now What?",
    date: "Nov 2026",
  },
  {
    slug: "protein-intake-guide",
    title: "How Much Protein Do You Actually Need?",
    date: "Oct 2026",
  },
  {
    slug: "calorie-deficit-tips",
    title: "How to Cut Calories Without Wanting to Quit",
    date: "Oct 2026",
  },
  {
    slug: "sleep-and-gains",
    title: "Sleep Is Doing More for Your Gains Than Your Pre-Workout",
    date: "Oct 2026",
  },
  {
    slug: "sugar-and-fat-loss",
    title: "Sugar Isn't the Enemy (But Here's What Is)",
    date: "Oct 2026",
  },
  {
    slug: "beginner-gym-mistakes",
    title: "5 Gym Mistakes That Are Costing You Gains",
    date: "Sep 2026",
  },
  {
    slug: "easy-meal-prep",
    title: "Meal Prep for People Who Hate Cooking",
    date: "Sep 2026",
  },
  {
    slug: "home-workouts",
    title: "Home Workouts That Actually Build Muscle",
    date: "Sep 2026",
  },
  {
    slug: "scale-weight-fluctuations",
    title: "Why Your Scale Weight Jumped 3 Pounds Overnight",
    date: "Aug 2026",
  },
  {
    slug: "cardio-vs-lifting",
    title: "Cardio vs Lifting: Which One Actually Burns More Fat?",
    date: "Aug 2026",
  },
  {
    slug: "water-intake-guide",
    title: "How Much Water Do You Actually Need?",
    date: "Aug 2026",
  },
  {
    slug: "read-nutrition-labels",
    title: "How to Read a Nutrition Label in 10 Seconds",
    date: "Jul 2026",
  },
  {
    slug: "lean-bulk-guide",
    title: "How to Gain Muscle Without Getting Fat",
    date: "Jul 2026",
  },
  {
    slug: "morning-vs-evening-gym",
    title: "Morning vs Evening Workouts: Does It Actually Matter?",
    date: "Jul 2026",
  },
  {
    slug: "tracking-macros-guide",
    title: "The No-Nonsense Guide to Tracking Macros",
    date: "Jun 2026",
  },
  {
    slug: "best-workout-split",
    title: "The Best Workout Split (Hint: It's the One You'll Do)",
    date: "Jun 2026",
  },
];

export default function BlogIndex() {
  return (
    <div
      className={jakarta.className}
      style={{
        background: "#fff",
        minHeight: "100dvh",
        maxWidth: 620,
        margin: "0 auto",
        padding: "0 1.5rem 5rem",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.5rem 0 3rem",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#111",
            }}
          >
            PocketGym
          </span>
        </Link>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#111",
            textDecoration: "none",
            padding: "0.4rem 0.9rem",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
          }}
        >
          Get the app
        </a>
      </nav>

      <h1
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: "#111",
          letterSpacing: "-0.04em",
          lineHeight: 1.15,
          marginBottom: "0.25rem",
        }}
      >
        Blog
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "#999",
          lineHeight: 1.5,
          marginBottom: "2.5rem",
        }}
      >
        Practical fitness and nutrition guides.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {POSTS.map((post, i) => (
          <Link
            key={post.slug}
            href={`/v1/blog/${post.slug}`}
            style={{
              textDecoration: "none",
              padding: "1.25rem 0",
              borderTop: i === 0 ? "1px solid #f0f0f0" : "none",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 16,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111",
                letterSpacing: "-0.01em",
                lineHeight: 1.4,
              }}
            >
              {post.title}
            </h2>
            <span
              style={{
                fontSize: 13,
                color: "#bbb",
                flexShrink: 0,
              }}
            >
              {post.date}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
