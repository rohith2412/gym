import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "lean-bulk-guide";
const TITLE = "How to Gain Muscle Without Getting Fat";
const DESC =
  "The lean bulking playbook. Small surplus, enough protein, hard training — how to add muscle without the dreaded \"permabulk\" body fat creep.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords:
    "lean bulk guide, how to bulk without getting fat, clean bulk, muscle gain diet, lean bulking tips",
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
    datePublished: "2026-07-08",
    dateModified: "2026-07-08",
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
      <p style={S.date}>July 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        "Eat big to get big" is the worst advice in fitness. It's technically
        true — you need a calorie surplus to build muscle. But most people
        interpret it as a free pass to eat everything in sight, and they end
        up gaining way more fat than muscle.
      </p>
      <p style={S.p}>
        A lean bulk is the fix. You gain muscle at close to the maximum rate
        your body allows while keeping fat gain to a minimum. Here's how.
      </p>

      <h2 style={S.h2}>A small surplus is all you need</h2>
      <p style={S.p}>
        Your body can only build so much muscle per day. For most natural
        lifters, that's about 0.5–1 lb of muscle per month under good
        conditions. You don't need 1,000 extra calories to support that —
        200–350 above your maintenance is plenty.
      </p>
      <p style={S.p}>
        Find your maintenance calories (use your bodyweight × 15 as a rough
        starting point), then add 200–350 on top. If you weigh 170 lbs,
        that's about 2,550 + 300 = 2,850 per day. Simple.
      </p>

      <h2 style={S.h2}>Protein: the floor is 0.8g/lb</h2>
      <p style={S.p}>
        During a bulk, protein doesn't need to be sky-high because you've
        got plenty of energy from carbs and fats. But it still needs to be
        adequate. Aim for at least 0.8g per pound of bodyweight. For our 170
        lb lifter, that's 136g/day.
      </p>
      <p style={S.p}>
        Fill the rest of your calories with carbs and fats in whatever ratio
        you prefer. Carbs are especially useful around training — they fuel
        your workouts and help with recovery.
      </p>

      <h2 style={S.h2}>Training has to be hard</h2>
      <p style={S.p}>
        Eating in a surplus without training hard is just getting fat on
        purpose. The surplus exists to fuel muscle growth, and muscle growth
        requires progressive overload — gradually increasing weight, reps,
        or volume over time.
      </p>
      <p style={S.p}>
        Train each muscle group 2× per week. Push your working sets close to
        failure (within 1–3 reps). Log your lifts so you know when you're
        actually progressing and when you're just going through the motions.
        PocketGym's workout tracker makes this brainless — log the set, see
        if you beat last week.
      </p>

      <h2 style={S.h2}>Monitor the rate of gain</h2>
      <p style={S.p}>
        Weigh yourself weekly (same conditions — morning, after bathroom).
        You want to see roughly 0.5–1 lb per week of total weight gain.
        Faster than that? You're gaining more fat than necessary. Cut the
        surplus back by 100–150 calories. Slower? Bump it up.
      </p>
      <p style={S.p}>
        This is a marathon, not a sprint. A successful 6-month lean bulk
        might add 10–12 lbs on the scale, of which 6–8 lbs is muscle. That
        doesn't sound like much, but 8 lbs of muscle looks dramatically
        different than 8 lbs of fat.
      </p>

      <h2 style={S.h2}>When to stop bulking</h2>
      <p style={S.p}>
        Once you hit about 18–20% body fat (for men) or 28–30% (for women),
        it's worth switching to a cut. Going much higher makes the subsequent
        fat loss phase longer and more annoying, and your body becomes less
        efficient at partitioning nutrients toward muscle at higher body fat
        levels.
      </p>
      <p style={S.p}>
        There's no exact science here — go by the mirror and how your clothes
        fit more than a number on a chart.
      </p>

      <h2 style={S.h2}>The short version</h2>
      <p style={S.p}>
        Eat 200–350 calories above maintenance. Get 0.8g+ protein per pound
        of bodyweight. Lift hard with progressive overload. Gain 0.5–1 lb per
        week. Adjust if you're gaining too fast or too slow. Cut when body
        fat gets uncomfortable. Repeat.
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
