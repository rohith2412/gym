import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "eating-out-on-a-diet";
const TITLE = "How to Eat at Restaurants Without Blowing Your Diet";
const DESC =
  "You don't have to avoid restaurants while dieting. A few ordering habits make restaurant meals fit your targets without the guilt.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: "eating out on a diet, restaurant diet tips, how to eat out and lose weight, healthy restaurant choices, dining out macros",
  alternates: { canonical: `${BASE_URL}/v1/blog/${SLUG}` },
  openGraph: { title: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, siteName: "YourPocketGym", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

function JsonLd() {
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, publisher: { "@type": "Organization", name: "YourPocketGym", url: BASE_URL }, datePublished: "2026-11-03", dateModified: "2026-11-03" };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function Page() {
  return (
    <BlogLayout>
      <JsonLd />
      <p style={S.date}>November 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        "I can't eat out, I'm on a diet." This is how diets die. You avoid
        social situations for a few weeks, get sick of it, and then the
        diet's over. A better approach: learn to eat at restaurants in a way
        that doesn't blow your numbers.
      </p>

      <h2 style={S.h2}>Protein first, always</h2>
      <p style={S.p}>
        Look at the menu and find the protein. Grilled chicken, steak, fish,
        prawns — whatever's there that isn't battered and deep-fried. Build
        your order around that. Most restaurant meals are 60% carbs and fat
        with a sad amount of protein. Flip the ratio.
      </p>
      <p style={S.p}>
        "Grilled salmon with vegetables" will always be a better choice than
        "salmon pasta" even though both have salmon. The first is 400–500
        calories. The second is 800–1,000 because of the cream, oil, and
        pasta.
      </p>

      <h2 style={S.h2}>Sauces and dressings are where calories hide</h2>
      <p style={S.p}>
        A grilled chicken salad sounds healthy until the kitchen drowns it in
        Caesar dressing. That dressing alone can be 300+ calories. Ask for
        dressing on the side and use half. Ask how things are cooked — "grilled"
        and "pan-fried in butter" are very different.
      </p>
      <p style={S.p}>
        This isn't about being annoying. Most restaurants are used to these
        requests. A quick "can I get the dressing on the side?" takes two
        seconds and saves you 200 calories you wouldn't have even noticed.
      </p>

      <h2 style={S.h2}>Don't starve yourself before dinner</h2>
      <p style={S.p}>
        The classic move: eat nothing all day to "save calories" for a
        restaurant dinner. Then you show up starving, eat the entire bread
        basket, order the biggest thing on the menu, and finish with dessert.
        You end up eating more than if you'd had a normal day.
      </p>
      <p style={S.p}>
        Eat normally during the day. If anything, have a protein-heavy lunch
        so you're not ravenous when you sit down.
      </p>

      <h2 style={S.h2}>One indulgence per meal, not three</h2>
      <p style={S.p}>
        You don't have to order the grilled chicken and steamed broccoli every
        time. That's not living. Pick one thing to enjoy — the burger, the
        pasta, the dessert — and make the rest of the meal reasonable. Having
        the burger with a side salad instead of fries saves 300–400 calories.
        Having a light main and then dessert works too.
      </p>
      <p style={S.p}>
        The problem is when every course is the indulgence. Starter, heavy
        main, dessert, and three cocktails — that's a 3,000 calorie meal.
        Pick your lane.
      </p>

      <h2 style={S.h2}>Snap it and move on</h2>
      <p style={S.p}>
        Restaurant meals are hard to estimate by eye. A photo log in PocketGym
        gives you a ballpark — not perfect, but far better than pretending the
        meal didn't happen or obsessing about it for three days after.
      </p>
      <p style={S.p}>
        The real skill isn't avoiding restaurants. It's making slightly better
        choices when you're there, logging it, and getting back to your normal
        routine the next day. One meal doesn't make or break anything. A pattern
        of meals does.
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
