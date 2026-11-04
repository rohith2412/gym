import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "water-intake-guide";
const TITLE = "How Much Water Do You Actually Need?";
const DESC =
  "The 8 glasses a day rule is made up. Here's what actually determines how much water you need and how to tell if you're drinking enough.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: "how much water to drink, water intake for gym, hydration for working out, daily water needs, water and muscle",
  alternates: { canonical: `${BASE_URL}/v1/blog/${SLUG}` },
  openGraph: { title: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, siteName: "YourPocketGym", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

function JsonLd() {
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, publisher: { "@type": "Organization", name: "YourPocketGym", url: BASE_URL }, datePublished: "2026-08-20", dateModified: "2026-08-20" };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function Page() {
  return (
    <BlogLayout>
      <JsonLd />
      <p style={S.date}>August 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        "Drink 8 glasses a day." Everyone's heard it. Nobody knows where it
        came from. The best anyone can trace it to is a 1945 US government
        recommendation that included the footnote "most of this quantity is
        contained in prepared foods" — a detail that got lost in translation
        for the next 80 years.
      </p>

      <h2 style={S.h2}>The real answer: it depends</h2>
      <p style={S.p}>
        How much water you need depends on your body size, activity level,
        climate, and how much water you're getting from food. A 130 lb person
        who works at a desk in London needs less than a 200 lb person
        training twice a day in Sydney.
      </p>
      <p style={S.p}>
        A reasonable starting point: roughly half your bodyweight in pounds,
        expressed as ounces. So a 170 lb person would aim for about 85 oz
        (~2.5 litres). Add 500ml–1L for every hour of training.
      </p>

      <h2 style={S.h2}>The easiest way to check</h2>
      <p style={S.p}>
        Forget counting ounces. Look at your pee. Pale yellow means you're
        hydrated. Dark yellow means drink more. Clear means you're probably
        overdoing it (your kidneys are working overtime to dump the excess).
      </p>
      <p style={S.p}>
        First thing in the morning it'll be darker — that's normal after 8
        hours without water. By mid-morning it should be pale if you're on
        track.
      </p>

      <h2 style={S.h2}>Why it matters for training</h2>
      <p style={S.p}>
        Even mild dehydration — 2% of bodyweight — measurably reduces
        strength, endurance, and focus. That's less than 2 lbs of water loss
        for most people, which you can hit with a hard gym session and no
        water bottle.
      </p>
      <p style={S.p}>
        Muscle is about 75% water. Dehydrated muscles look flat, perform
        worse, and cramp more easily. If you've ever had an unexplainably
        weak session, dehydration is a likely culprit.
      </p>

      <h2 style={S.h2}>Coffee counts (mostly)</h2>
      <p style={S.p}>
        The "coffee dehydrates you" thing is a myth for regular coffee
        drinkers. Caffeine is a mild diuretic, but the water in the coffee
        more than offsets it. Your morning coffee counts toward your fluid
        intake. Alcohol, on the other hand, actually does dehydrate you.
      </p>

      <h2 style={S.h2}>Make it easy</h2>
      <p style={S.p}>
        Keep a water bottle on your desk and take it to the gym. That alone
        fixes 90% of hydration issues. If you forget to drink, PocketGym can
        track your water intake alongside your meals — a few taps each time
        you finish a bottle builds the habit without overthinking it.
      </p>
      <p style={S.p}>
        Don't chug a litre right before bed (you'll just wake up at 3am).
        Front-load your intake earlier in the day and taper off in the evening.
      </p>
    </BlogLayout>
  );
}

const S = {
  h1: { fontSize: 32, fontWeight: 800, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "2rem" },
  date: { fontSize: 13, color: "#999", fontWeight: 500, marginBottom: 8 },
  h2: { fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: "-0.03em", marginTop: "3rem", marginBottom: "0.75rem" },
  p: { fontSize: 17, color: "#333", lineHeight: 1.8, marginBottom: "1.5rem" },
};
