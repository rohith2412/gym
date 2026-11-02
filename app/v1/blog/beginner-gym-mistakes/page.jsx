import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "beginner-gym-mistakes";
const TITLE = "5 Gym Mistakes That Are Costing You Gains";
const DESC =
  "The most common beginner gym mistakes — program hopping, ignoring food, ego lifting — and how to fix them before you waste another six months.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords:
    "beginner gym mistakes, common workout mistakes, gym tips for beginners, why am I not gaining muscle, new to gym",
  alternates: { canonical: `${BASE_URL}/v1/blog/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${BASE_URL}/v1/blog/${SLUG}`,
    siteName: "YourPocketGym",
    type: "article",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESC,
    url: `${BASE_URL}/v1/blog/${SLUG}`,
    publisher: { "@type": "Organization", name: "YourPocketGym", url: BASE_URL },
    datePublished: "2026-09-20",
    dateModified: "2026-09-20",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function Page() {
  return (
    <BlogLayout>
      <JsonLd />
      <p style={S.date}>September 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        Nobody walks into the gym knowing what they're doing. That's fine —
        we all started somewhere. But some mistakes burn weeks or months of
        effort, and they're easy to dodge once someone points them out.
      </p>

      <h2 style={S.h2}>1. Changing your program every two weeks</h2>
      <p style={S.p}>
        You start a PPL split. Two weeks in, a YouTube video convinces you
        that full body is better. Three weeks later, someone at the gym
        mentions German Volume Training. You've now done three programs and
        finished none of them.
      </p>
      <p style={S.p}>
        Pick a program. Run it for 8–12 weeks. That's the minimum time to
        know if something is working. The best program isn't the "optimal"
        one — it's the one you stick with long enough to actually progress.
      </p>

      <h2 style={S.h2}>2. Ignoring what you eat</h2>
      <p style={S.p}>
        You can't out-train a bad diet and you can't build muscle on air.
        If you're training hard but not eating enough protein, you're doing
        cardio with extra steps. If you're trying to lose weight but have no
        idea how many calories you eat, you're guessing.
      </p>
      <p style={S.p}>
        You don't need to be obsessive about it. Just know the basics: how
        much protein you're getting, and roughly where your calories land.
        A week of tracking with PocketGym — snap your meals, check the
        numbers — tells you more about your diet than months of guessing.
      </p>

      <h2 style={S.h2}>3. Ego lifting</h2>
      <p style={S.p}>
        Nobody in the gym cares how much you bench. Really. The guy squatting
        400 lbs is too busy focusing on his own set to notice your 135. Load
        the bar with a weight you can actually control through the full range
        of motion, and add weight gradually.
      </p>
      <p style={S.p}>
        Half-reps with too much weight build nothing except a future injury.
        Full reps with moderate weight, done consistently, build everything.
      </p>

      <h2 style={S.h2}>4. Skipping progressive overload</h2>
      <p style={S.p}>
        If you bench 60kg every Monday for six months, your body has no reason
        to get stronger. Progressive overload means gradually increasing the
        demand — more weight, more reps, or more sets over time.
      </p>
      <p style={S.p}>
        Keep a simple log of what you lift. Last week you did 3×8 at 60kg?
        Try 3×9 this week, or bump to 62.5kg. Tiny increases, compounded over
        months, are how you go from beginner to actually strong.
      </p>

      <h2 style={S.h2}>5. Not sleeping enough</h2>
      <p style={S.p}>
        This one gets overlooked constantly. Muscle doesn't grow in the gym —
        it grows while you sleep. If you're getting five hours a night and
        wondering why your lifts are stalling, that's your answer.
      </p>
      <p style={S.p}>
        Seven to nine hours. It's boring advice. It's also the single most
        effective performance enhancer available to you, and it's free.
      </p>

      <h2 style={S.h2}>The good news</h2>
      <p style={S.p}>
        Being a beginner is actually the best position to be in. You'll make
        faster progress in your first year of serious training than at any
        other point. Just don't waste it by spinning your wheels on the stuff
        above. Pick a program, eat enough food, lift with your ego in check,
        push the weights up over time, and sleep. That's it. That's the whole
        secret.
      </p>
    </BlogLayout>
  );
}

const S = {
  h1: { fontSize: "clamp(28px, 6vw, 40px)", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: "1.5rem" },
  date: { fontSize: 13, color: "#bbb", fontWeight: 600, marginBottom: 8 },
  h2: { fontSize: 22, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em", marginTop: "2.5rem", marginBottom: "0.75rem" },
  p: { fontSize: 16, color: "#444", lineHeight: 1.75, marginBottom: "1.25rem" },
  strong: { color: "#1a1a1a", fontWeight: 700 },
};
