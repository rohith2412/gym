import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "sugar-and-fat-loss";
const TITLE = "Sugar Isn't the Enemy (But Here's What Is)";
const DESC =
  "Sugar doesn't make you fat. Eating too many calories makes you fat. Here's why demonising one nutrient misses the point entirely.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: "is sugar bad for you, sugar and weight gain, does sugar make you fat, calories vs sugar, sugar myths",
  alternates: { canonical: `${BASE_URL}/v1/blog/${SLUG}` },
  openGraph: { title: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, siteName: "YourPocketGym", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

function JsonLd() {
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, publisher: { "@type": "Organization", name: "YourPocketGym", url: BASE_URL }, datePublished: "2026-10-08", dateModified: "2026-10-08" };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function Page() {
  return (
    <BlogLayout>
      <JsonLd />
      <p style={S.date}>October 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        Every decade picks a dietary villain. In the 90s it was fat. Then
        carbs. Now it's sugar. Documentaries warn you that sugar is "toxic."
        Instagram influencers say it's "literally poison." Health food brands
        slap "no added sugar" on everything.
      </p>
      <p style={S.p}>
        Here's the boring truth: sugar is just a carbohydrate. It has 4
        calories per gram, same as any other carb. It doesn't have special
        fat-storing properties. It doesn't bypass your metabolism. It's
        energy, and if you eat more total energy than you burn, you gain
        weight. That's it.
      </p>

      <h2 style={S.h2}>Why sugar gets blamed</h2>
      <p style={S.p}>
        Sugar makes things taste good, and things that taste good are easy to
        overeat. Nobody binge-eats plain chicken breast, but a box of biscuits
        can disappear without you noticing. The problem isn't the sugar
        molecule — it's that sugary foods are calorie-dense, low in protein,
        low in fibre, and easy to consume in large quantities.
      </p>
      <p style={S.p}>
        A tablespoon of honey in your oatmeal isn't why you're not losing
        weight. The 2,800 calories you're eating in a day when your
        maintenance is 2,300 — that's why.
      </p>

      <h2 style={S.h2}>The real enemy: total calorie surplus</h2>
      <p style={S.p}>
        You can eat zero sugar and still gain fat if your total calories are
        too high. You can eat some sugar every day and lose fat if you're in a
        deficit. This has been demonstrated in controlled studies repeatedly.
        The famous "Twinkie diet" professor lost 27 lbs eating convenience
        store snacks — because he ate fewer total calories.
      </p>
      <p style={S.p}>
        That doesn't mean you should eat only Twinkies. It means that
        demonising one ingredient while ignoring total intake is backwards
        thinking.
      </p>

      <h2 style={S.h2}>What you should actually watch</h2>
      <p style={S.p}>
        Calories in vs. calories out determines weight change. Within that,
        protein protects muscle, fibre keeps you full, and micronutrients from
        whole foods keep everything running. Hit those targets and the exact
        source of your remaining carbs — whether it's rice, fruit, or a bit
        of chocolate — matters much less than people think.
      </p>

      <h2 style={S.h2}>Where sugar does cause problems</h2>
      <p style={S.p}>
        Liquid sugar is different. Fizzy drinks, juice, and sugary coffee
        drinks add hundreds of calories without making you feel full at all.
        A large Coke is 250 calories. Drink two a day and that's 3,500
        extra calories per week — a full pound of fat.
      </p>
      <p style={S.p}>
        If you're going to cut sugar anywhere, cut it from drinks first.
        Switch to water, black coffee, or diet versions. That single change
        often creates enough of a calorie deficit to start losing weight
        without changing anything else.
      </p>

      <h2 style={S.h2}>Stop moralising food</h2>
      <p style={S.p}>
        Food isn't "clean" or "dirty." It isn't "good" or "bad." It's fuel
        with different nutrient profiles. Some foods are more useful for your
        goals than others. A chicken breast is more useful for hitting protein
        targets than a cookie. But the cookie isn't poison.
      </p>
      <p style={S.p}>
        Track your actual intake in PocketGym for a week. Look at your total
        calories and your protein. Those two numbers will tell you more about
        why you're gaining or losing weight than any documentary about sugar
        ever will.
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
