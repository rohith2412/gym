import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "best-workout-split";
const TITLE = "The Best Workout Split (Hint: It's the One You'll Actually Do)";
const DESC =
  "PPL, upper/lower, full body, bro split — which workout split is best? The honest answer, plus how to pick one that fits your actual schedule.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords:
    "best workout split, PPL vs upper lower, full body vs split, workout routine for beginners, gym split for 3 days",
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
    datePublished: "2026-06-10",
    dateModified: "2026-06-10",
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
      <p style={S.date}>June 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        Reddit threads about workout splits go on forever. PPL is the best.
        No, upper/lower is superior. Actually, full body is the only
        evidence-based approach. Meanwhile, the guy doing a basic bro split
        consistently for two years looks better than all of them.
      </p>
      <p style={S.p}>
        Here's the uncomfortable truth: the differences between splits are
        tiny compared to the difference between training consistently and not.
      </p>

      <h2 style={S.h2}>The options, honestly</h2>
      <p style={S.p}>
        <strong style={S.strong}>Full body (3 days/week):</strong> Every
        session hits everything. Great if you can only train 3 days. Each
        muscle gets hit 3× per week, which research suggests is at least as
        good as 2× for growth. Sessions are longer and harder because you're
        doing a lot in one go.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Upper/Lower (4 days/week):</strong> Two
        upper body days, two lower body days. Solid balance of frequency and
        volume. Great for intermediates. Sessions are manageable in 50–60
        minutes.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>PPL — Push/Pull/Legs (6 days/week):</strong>{" "}
        High frequency, high volume. Each muscle group gets hit 2× per week.
        The gold standard if you have the time and recovery capacity. Not
        realistic for everyone.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Bro split (5 days/week):</strong> Chest
        Monday, back Tuesday, etc. Each muscle once per week. Not "optimal" on
        paper, but plenty of people have built great physiques with it. The
        lower frequency is the downside; the focused volume per session is the
        upside.
      </p>

      <h2 style={S.h2}>Match the split to your schedule</h2>
      <p style={S.p}>
        This is the only thing that actually matters. If you can realistically
        get to the gym 3 days a week, do full body. If you can manage 4, do
        upper/lower. If you have 5–6 days, PPL works great.
      </p>
      <p style={S.p}>
        What doesn't work: picking a 6-day PPL program when you know you'll
        skip two days most weeks. A 3-day full body program done consistently
        beats a 6-day program done sporadically.
      </p>

      <h2 style={S.h2}>Frequency matters more than the split</h2>
      <p style={S.p}>
        The research is pretty clear: hitting each muscle group at least
        twice per week is better than once. The mechanism is simple — muscle
        protein synthesis (the process of building muscle) peaks about 24–48
        hours after training and then drops off. Training a muscle once a
        week means it's "growing" for 2 days and doing nothing for 5.
      </p>
      <p style={S.p}>
        Any split that hits each muscle 2–3× per week is in the sweet spot.
        Full body, upper/lower, and PPL all do this. The classic bro split
        doesn't, which is its main limitation.
      </p>

      <h2 style={S.h2}>Keep it simple and track it</h2>
      <p style={S.p}>
        Pick 4–6 exercises per session. Focus on compound movements (squat,
        bench, deadlift, rows, overhead press, pull-ups) and add 1–2
        isolation exercises for muscles you care about. Do 3–4 sets of each.
        That's your program.
      </p>
      <p style={S.p}>
        Log every session. You need to know what you lifted last week so you
        can beat it this week. Progressive overload only works if you're
        actually tracking it. PocketGym's workout log takes about 10 seconds
        per set — punch in the weight and reps, and you'll see exactly where
        you stand next time you walk into the gym.
      </p>

      <h2 style={S.h2}>Stop optimising, start showing up</h2>
      <p style={S.p}>
        The best program is one you'll run for 12+ weeks without switching.
        The best split is the one that fits the days you actually go to the
        gym. The best exercise selection is the movements you can do safely
        and progressively load over time.
      </p>
      <p style={S.p}>
        None of the details matter if you don't show up. Pick something
        reasonable, commit to it for three months, and watch what happens.
        You'll probably be surprised.
      </p>
    </BlogLayout>
  );
}

const S = {
  h1: { fontSize: 32, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "2rem" },
  date: { fontSize: 13, color: "#999", fontWeight: 500, marginBottom: 8 },
  h2: { fontSize: 20, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em", marginTop: "3rem", marginBottom: "0.75rem" },
  p: { fontSize: 17, color: "#333", lineHeight: 1.8, marginBottom: "1.5rem" },
  strong: { color: "#1a1a1a", fontWeight: 700 },
};
