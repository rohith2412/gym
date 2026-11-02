import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "read-nutrition-labels";
const TITLE = "How to Read a Nutrition Label in 10 Seconds";
const DESC =
  "Nutrition labels are designed to confuse you. Here's the cheat sheet: the only numbers that matter and the serving size trick companies use.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords:
    "how to read nutrition labels, nutrition facts explained, serving size trick, understanding food labels, calories per serving",
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
    datePublished: "2026-07-22",
    dateModified: "2026-07-22",
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
        Nutrition labels look straightforward. They're not. Food companies
        have gotten very good at making things look healthier than they are,
        and the serving size is their favourite weapon.
      </p>

      <h2 style={S.h2}>Step 1: Check the serving size first</h2>
      <p style={S.p}>
        This is where most people get tricked. A bag of crisps says "150
        calories" on the front. Sounds fine. Then you flip it over and see
        "serving size: 10 crisps." The bag has 40 crisps. You just ate 600
        calories, not 150.
      </p>
      <p style={S.p}>
        Always look at how many servings are in the container. Multiply the
        per-serving calories by the number of servings you actually eat. That
        pint of ice cream that says "280 calories"? It has 4 servings. If you
        eat the whole thing (and let's be honest, we've all been there), that's
        1,120 calories.
      </p>

      <h2 style={S.h2}>Step 2: Look at calories and protein</h2>
      <p style={S.p}>
        For most people trying to get in shape, these are the two numbers
        that matter most. Calories tell you how much energy you're getting.
        Protein tells you how much of it is actually useful for muscle and
        satiety.
      </p>
      <p style={S.p}>
        A good rule of thumb: look for at least 20–30g of protein per serving
        in a main meal item. If a frozen dinner has 8g of protein and 500
        calories, it's basically just carbs and fat dressed up as a meal.
      </p>

      <h2 style={S.h2}>Step 3: Glance at fibre</h2>
      <p style={S.p}>
        Fibre keeps you full and helps digestion. Most people don't get
        enough. If you're comparing two similar products — say, two breads
        or two cereals — pick the one with more fibre. It's usually a sign
        of better quality ingredients too.
      </p>

      <h2 style={S.h2}>What you can mostly ignore</h2>
      <p style={S.p}>
        <strong style={S.strong}>Total fat</strong> — unless you're on a
        specific low-fat diet, fat isn't the enemy. What matters is total
        calories.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>% Daily Value</strong> — these are based on
        a generic 2,000 calorie diet that may or may not apply to you. Not
        very useful.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Vitamins and minerals</strong> — nice to
        know, but you're not picking your lunch based on its Vitamin A
        content.
      </p>

      <h2 style={S.h2}>The ingredient list hack</h2>
      <p style={S.p}>
        Ingredients are listed in order of quantity. If sugar (or one of its
        aliases — corn syrup, dextrose, maltose, sucrose, "evaporated cane
        juice") is in the first three ingredients, the product is mostly
        sugar regardless of what the front of the package says.
      </p>

      <h2 style={S.h2}>When labels aren't available</h2>
      <p style={S.p}>
        Restaurant meals, street food, home cooking — most of the food you
        eat doesn't come with a label. This is where a photo-based tracker
        like PocketGym earns its keep. Snap a photo of your plate, get an
        instant calorie and macro estimate. Not perfect, but far better than
        guessing blindly.
      </p>

      <h2 style={S.h2}>The 10-second routine</h2>
      <p style={S.p}>
        Grab the product. Flip it over. Check serving size, multiply for what
        you'll actually eat. Check calories and protein. Done. It takes ten
        seconds once you get the habit, and it prevents a surprising number
        of "why am I not losing weight?" mysteries.
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
