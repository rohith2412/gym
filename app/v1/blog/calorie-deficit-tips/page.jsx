import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "calorie-deficit-tips";
const TITLE = "How to Cut Calories Without Wanting to Quit";
const DESC =
  "Practical tips for staying in a calorie deficit without feeling miserable. Volume eating, diet breaks, and the small swaps that actually add up.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords:
    "calorie deficit tips, how to cut calories, weight loss without starving, sustainable diet, volume eating tips",
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
    datePublished: "2026-10-10",
    dateModified: "2026-10-10",
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
      <p style={S.date}>October 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        Every diet starts the same way: you slash your calories, eat salads
        for three days, feel like garbage, and order pizza on Thursday night.
        The problem isn't willpower. It's that aggressive deficits are
        miserable and nobody can sustain miserable.
      </p>

      <h2 style={S.h2}>Start smaller than you think</h2>
      <p style={S.p}>
        A 300–500 calorie deficit is plenty. That's roughly one less snack or
        swapping your lunchtime chips for extra veg. At 500 cal/day, you're
        losing about a pound a week — which sounds slow until you realise
        that's 12 lbs in three months, and you didn't have to white-knuckle
        any of it.
      </p>
      <p style={S.p}>
        Those 1,200-calorie diets you see online? They work on paper. In
        practice, you lose muscle, your energy tanks, and you rebound harder
        than you started.
      </p>

      <h2 style={S.h2}>Eat more food, not less</h2>
      <p style={S.p}>
        Sounds backwards, but volume eating is the best-kept secret in
        dieting. A massive bowl of roasted broccoli, peppers, and mushrooms
        with 200g of chicken breast is ~400 calories and it'll fill you up
        for hours. A muffin from the coffee shop is also ~400 calories and
        you'll be hungry again in 45 minutes.
      </p>
      <p style={S.p}>
        Same calorie number, completely different experience. The trick is
        loading up on foods that take up space: vegetables, lean protein,
        fruit, potatoes, oats. They're low in calorie density and high in
        "feeling like you actually ate."
      </p>

      <h2 style={S.h2}>Protein is your best friend</h2>
      <p style={S.p}>
        Protein keeps you full. It also protects muscle when you're in a
        deficit, which matters a lot — the goal is to lose fat, not to
        become a smaller version of yourself with less muscle.
      </p>
      <p style={S.p}>
        Aim for that 0.8–1g per pound of bodyweight range. At every meal, ask
        yourself: "where's the protein?" If the answer is "uh, the cheese on
        my pasta," that's probably not enough.
      </p>

      <h2 style={S.h2}>Take breaks on purpose</h2>
      <p style={S.p}>
        After 8–12 weeks in a deficit, your body starts pushing back.
        Metabolism slows, hunger ramps up, sleep gets worse. This isn't
        failure — it's biology. A diet break (eating at maintenance for 1–2
        weeks) resets some of that.
      </p>
      <p style={S.p}>
        Think of it as a scheduled timeout, not cheating. You're not going
        backwards. You're letting your body catch up so the next stretch
        of dieting actually works.
      </p>

      <h2 style={S.h2}>Track enough to know, not so much you obsess</h2>
      <p style={S.p}>
        You don't need to log every gram for the rest of your life. But you
        do need to know roughly where you stand. Most people underestimate
        their intake by 30–50%. A few days of tracking is usually enough to
        spot the leaks — the cooking oil, the handful of nuts, the "just a
        splash" of cream in your coffee.
      </p>
      <p style={S.p}>
        PocketGym's photo logger takes about five seconds per meal. Snap your
        plate, see the calories. It's the fastest way to get a read on your
        actual intake without turning lunch into a maths exam.
      </p>

      <h2 style={S.h2}>One thing at a time</h2>
      <p style={S.p}>
        Don't overhaul everything on Monday. Pick one change this week. Maybe
        it's swapping your afternoon snack. Maybe it's adding protein to
        breakfast. Nail that, then add another. Stacking small wins is how
        people lose 30 lbs and keep it off. Crashing diets is how people lose
        10 lbs and gain back 15.
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
