import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "easy-meal-prep";
const TITLE = "Meal Prep for People Who Hate Cooking";
const DESC =
  "Simple meal prep that takes under an hour. No fancy recipes, no 47 containers. Two proteins, two carbs, one sheet pan. Done.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords:
    "easy meal prep, simple meal prep, meal prep for beginners, quick meal prep, healthy meal prep",
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
    datePublished: "2026-09-12",
    dateModified: "2026-09-12",
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
        Every meal prep guide on the internet involves seventeen spices, four
        different sauces, and someone who apparently has three hours free on
        Sunday. That's not real life for most people. This is the version for
        the rest of us.
      </p>

      <h2 style={S.h2}>The formula</h2>
      <p style={S.p}>
        Pick two proteins, two carbs, and one or two vegetables. Cook them all
        at once. Put them in containers. That's it. No recipe needed.
      </p>
      <p style={S.p}>
        Example: chicken thighs + ground turkey. Rice + sweet potatoes.
        Broccoli. Season the proteins differently (one with garlic and paprika,
        one with soy sauce and ginger) and suddenly you have two different
        meals from the same cook.
      </p>

      <h2 style={S.h2}>The one-hour Sunday cook</h2>
      <p style={S.p}>
        <strong style={S.strong}>Minute 0:</strong> Set rice cooker or pot of
        rice going. Chop sweet potatoes, toss with olive oil, into the oven at
        200°C.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Minute 5:</strong> Season chicken thighs.
        Into a pan or onto a sheet tray in the oven alongside the potatoes.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Minute 10:</strong> Brown the ground turkey
        in a second pan. Season however you like.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Minute 20:</strong> Steam or roast the
        broccoli. Check the chicken.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Minute 40:</strong> Everything's done or
        close. Let it cool for ten minutes, then portion into containers.
      </p>
      <p style={S.p}>
        You now have 8–10 meals for roughly an hour of work. That's the
        entire week's lunches handled.
      </p>

      <h2 style={S.h2}>Don't try to be fancy</h2>
      <p style={S.p}>
        The meal prep that sticks is the one that's boring enough to repeat.
        You don't need to make a different recipe every week. The point isn't
        gourmet food — it's having something ready when you're hungry so you
        don't order takeaway.
      </p>
      <p style={S.p}>
        If you get bored, change the seasoning or swap one protein. Don't
        rebuild the whole thing from scratch.
      </p>

      <h2 style={S.h2}>Know what's in it</h2>
      <p style={S.p}>
        One advantage of meal prep: you cooked it, so you know what went in.
        When you snap a photo of your prepped container in PocketGym, the AI
        can break down the macros fast because it's simple, recognisable food.
        No mystery sauces, no guessing about restaurant portion sizes.
      </p>

      <h2 style={S.h2}>The shopping list trick</h2>
      <p style={S.p}>
        Buy the same things every week. Sounds dull, works brilliantly. Your
        grocery trip takes fifteen minutes because you're not wandering the
        aisles deciding what sounds good. You know what you need, you grab it,
        you leave.
      </p>
      <p style={S.p}>
        A sample list: chicken thighs, ground turkey or beef, rice, sweet
        potatoes, broccoli, eggs, oats, Greek yoghurt, bananas, olive oil.
        Under $50 in most places, and it covers you for the week.
      </p>

      <h2 style={S.h2}>Start with just lunch</h2>
      <p style={S.p}>
        Don't try to prep breakfast, lunch, dinner, and snacks all at once.
        Start with just lunch — that's the meal most people either skip or
        buy something overpriced and underwhelming. Once lunch is handled,
        everything else gets easier because you've freed up one decision per
        day.
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
