import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "tracking-macros-guide";
const TITLE = "The No-Nonsense Guide to Tracking Macros";
const DESC =
  "How to track macros without becoming obsessive. Figure out your numbers, be consistent (not perfect), and know when to stop tracking.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords:
    "how to track macros, macro tracking guide, counting macros for beginners, macros for weight loss, IIFYM guide",
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
    datePublished: "2026-06-25",
    dateModified: "2026-06-25",
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
        Tracking macros has a reputation problem. People either think it's
        obsessive calorie-counting for fitness influencers, or they think
        it's unnecessary because they "eat pretty healthy." Both are wrong.
      </p>
      <p style={S.p}>
        Macro tracking is just knowing what you eat. It's a tool, not a
        lifestyle. And like any tool, you use it when you need it and put it
        down when you don't.
      </p>

      <h2 style={S.h2}>Figure out your numbers</h2>
      <p style={S.p}>
        Start with your total daily calories. Bodyweight in pounds × 15
        gives you a rough maintenance estimate. From there: trying to lose
        fat? Subtract 300–500. Trying to gain muscle? Add 200–350.
      </p>
      <p style={S.p}>
        For macros, keep it simple. Set protein first: 0.8–1g per pound of
        bodyweight. Set fat at about 25–30% of total calories (minimum — your
        hormones need dietary fat). Fill the rest with carbs.
      </p>
      <p style={S.p}>
        Example for a 170 lb person cutting at 2,200 calories: 150g protein
        (600 cal), 65g fat (585 cal), 254g carbs (1,015 cal). Done. Those are
        your targets.
      </p>

      <h2 style={S.h2}>Be consistent, not exact</h2>
      <p style={S.p}>
        Nobody hits their macros perfectly every day. That's fine. If your
        protein target is 150g and you hit 140g, that's a win. If you're at
        100g, that's something to fix. Think of your targets as a range, not
        an exact number.
      </p>
      <p style={S.p}>
        The goal is to be in the ballpark most days, not to turn eating into
        an arithmetic problem. Within ±10% is close enough to see results.
      </p>

      <h2 style={S.h2}>You don't need to weigh everything</h2>
      <p style={S.p}>
        A food scale is useful for the first week or two — it calibrates your
        eye. After that, eyeballing works for most things. A palm-size piece
        of chicken is roughly 30g of protein. A fist of rice is about a cup.
        You'll get surprisingly accurate once you've measured a few times.
      </p>
      <p style={S.p}>
        For the meals that are hard to eyeball — restaurant food, mixed
        dishes, that weird salad from the work canteen — just snap a photo
        in PocketGym and let the AI estimate it. It won't be exact, but
        "roughly right" beats "no idea" every time.
      </p>

      <h2 style={S.h2}>Log before you eat, not after</h2>
      <p style={S.p}>
        This is the one habit that makes tracking actually useful. Log your
        meals in advance (or at least in the moment). Logging at the end of
        the day from memory is inaccurate and defeating — you can't change
        what you already ate.
      </p>
      <p style={S.p}>
        If you plan your meals the night before or in the morning, you can
        adjust throughout the day. "I'm at 90g protein and it's 4pm — I
        need a protein-heavy dinner" is much more actionable than "I only
        ate 80g of protein today, oops."
      </p>

      <h2 style={S.h2}>When to stop tracking</h2>
      <p style={S.p}>
        Tracking isn't meant to be forever. It's training wheels. After a
        few months, most people develop an intuitive sense of what ~150g of
        protein looks like, what a reasonable portion size is, and roughly
        where their calories land.
      </p>
      <p style={S.p}>
        At that point, you can stop daily tracking and just check in once
        a week or whenever things feel off. If your weight starts drifting
        in a direction you don't want, a few days of tracking usually
        reveals the problem instantly.
      </p>

      <h2 style={S.h2}>The 80/20 rule</h2>
      <p style={S.p}>
        If 80% of your meals are whole foods with decent protein and
        reasonable portions, the other 20% can be whatever you want. A slice
        of pizza, some chocolate, a beer with friends — it all fits as long
        as the big picture is solid. Tracking helps you see the big picture.
        That's all it is.
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
