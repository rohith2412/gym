import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "scale-weight-fluctuations";
const TITLE = "Why Your Scale Weight Jumped 3 Pounds Overnight";
const DESC =
  "You didn't gain 3 lbs of fat in one day. Here's why scale weight fluctuates and why weekly averages matter way more than daily weigh-ins.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords:
    "scale weight fluctuation, why did I gain weight overnight, water weight, daily weight changes, weight loss plateau",
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
    datePublished: "2026-08-28",
    dateModified: "2026-08-28",
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
      <p style={S.date}>August 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        You wake up, step on the scale, and it reads 3 lbs heavier than
        yesterday. Instant panic. All that work for nothing, right?
      </p>
      <p style={S.p}>
        Relax. You did not gain 3 lbs of fat overnight. That would require
        eating roughly 10,500 extra calories above your maintenance in a
        single day. Unless you ate an entire Costco pizza and then went back
        for seconds, that's not what happened.
      </p>

      <h2 style={S.h2}>What's actually going on</h2>
      <p style={S.p}>
        Most day-to-day weight swings are water. Your body holds onto water
        for a bunch of reasons, and nearly all of them are temporary.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Sodium.</strong> Had sushi, ramen, or
        anything from a restaurant last night? Restaurant food is loaded with
        salt. More sodium = more water retention. You'll pee it out over the
        next day or two.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Carbs.</strong> Every gram of glycogen
        (stored carbs) holds about 3g of water. If you had a high-carb day
        after eating low-carb for a while, your muscles are just topped up
        with fuel. This is a good thing, not fat gain.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Stress and sleep.</strong> Cortisol (the
        stress hormone) causes water retention. A bad night of sleep, a
        stressful day at work, a hard workout — all of these can bump the
        scale up temporarily.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Digestion.</strong> If you ate a big dinner
        late, the food is literally still in your system. It has weight. It'll
        be gone by tomorrow.
      </p>

      <h2 style={S.h2}>Weekly averages are what matter</h2>
      <p style={S.p}>
        Weigh yourself every morning under the same conditions (after the
        bathroom, before eating). Then look at the weekly average, not any
        single day. If your average is trending down over 2–3 weeks, you're
        losing fat. Period. The daily number is noise.
      </p>
      <p style={S.p}>
        This is exactly why PocketGym tracks your weight as a trend line, not
        a single number. You log it, and over time you see the actual
        direction your body is headed — not the random blip from last
        night's pad thai.
      </p>

      <h2 style={S.h2}>When to actually worry</h2>
      <p style={S.p}>
        If your weekly average has been going up for 3+ weeks and you're
        trying to lose weight, something's off. Either your calorie estimate
        is wrong, you're eating more than you think, or your activity level
        dropped. That's when you troubleshoot — not after one weird morning
        on the scale.
      </p>

      <h2 style={S.h2}>For the women reading this</h2>
      <p style={S.p}>
        Menstrual cycle fluctuations can cause 2–5 lbs of water retention,
        usually in the week before your period. This is completely normal and
        comparing your weight week-to-week within the same cycle phase gives
        you a much more accurate picture than comparing random days.
      </p>

      <h2 style={S.h2}>The takeaway</h2>
      <p style={S.p}>
        The scale is one data point, not the whole story. A 3 lb jump after a
        salty dinner means nothing. A slow, consistent downward trend over
        weeks means everything. Don't let a single number ruin your morning.
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
