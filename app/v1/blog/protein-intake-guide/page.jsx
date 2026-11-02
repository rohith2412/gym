import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "protein-intake-guide";
const TITLE = "How Much Protein Do You Actually Need?";
const DESC =
  "The real numbers on protein intake for muscle gain and fat loss. Not bro-science — what research says about how much protein you need per day.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords:
    "how much protein do I need, protein intake for muscle, daily protein requirements, protein per pound bodyweight, high protein diet",
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
    publisher: {
      "@type": "Organization",
      name: "YourPocketGym",
      url: BASE_URL,
    },
    datePublished: "2026-10-15",
    dateModified: "2026-10-15",
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
        Ask ten people at the gym how much protein they eat and you'll get ten
        different answers. One guy swears by 2 grams per pound. Another heard
        0.5g is plenty. Someone's personal trainer told them to "just eat
        chicken." None of this is helpful.
      </p>
      <p style={S.p}>
        Here's what the research actually says, minus the noise.
      </p>

      <h2 style={S.h2}>The short answer</h2>
      <p style={S.p}>
        <strong style={S.strong}>0.7–1g per pound of bodyweight per day.</strong>{" "}
        That's the range where pretty much every well-designed study lands.
        If you weigh 170 lbs, that's roughly 120–170g of protein daily.
      </p>
      <p style={S.p}>
        Below 0.7g/lb and you're probably leaving muscle on the table.
        Above 1g/lb and you're not getting much extra benefit — it won't hurt
        you, but you're paying for expensive protein that could be cheaper
        carbs or fats.
      </p>

      <h2 style={S.h2}>When to aim higher</h2>
      <p style={S.p}>
        If you're in a calorie deficit (trying to lose fat), bump it up closer
        to 1g/lb or even a touch above. When you're eating less food overall,
        higher protein does two things: it keeps you full longer, and it
        protects the muscle you already have. Losing weight is easy. Losing fat
        while keeping muscle takes a bit more protein.
      </p>
      <p style={S.p}>
        If you're brand new to lifting, you can also benefit from more protein
        since your body is primed to build muscle fast in those first few
        months.
      </p>

      <h2 style={S.h2}>When it matters less</h2>
      <p style={S.p}>
        If you're in a calorie surplus (bulking), you can get away with the
        lower end — 0.7g/lb is fine. You've got extra energy from food already,
        so your body isn't cannibalising muscle for fuel.
      </p>
      <p style={S.p}>
        And if you're not lifting at all? Honestly, you still benefit from
        decent protein (it's satiating and good for bone density), but you
        don't need to stress about hitting 1g/lb.
      </p>

      <h2 style={S.h2}>What does 150g of protein actually look like?</h2>
      <p style={S.p}>
        It's less dramatic than you think. A typical day might be: eggs at
        breakfast (20g), a chicken wrap at lunch (35g), Greek yoghurt as a
        snack (15g), and a decent portion of salmon or steak at dinner (40g).
        That's already 110g without trying very hard. A protein shake or a
        handful of cottage cheese gets you the rest.
      </p>
      <p style={S.p}>
        The trick isn't cramming it all into one meal — it's spreading it
        across the day so you're never playing catch-up at 9pm.
      </p>

      <h2 style={S.h2}>Stop guessing, start checking</h2>
      <p style={S.p}>
        Most people who say "I eat enough protein" are eating about half what
        they think. The only way to know is to actually track it for a week.
        Not forever — just long enough to calibrate your gut feeling.
      </p>
      <p style={S.p}>
        PocketGym makes this dead simple: snap a photo of your meal and the
        AI breaks down protein, carbs, fat, and calories in seconds. No
        searching databases, no weighing every ingredient. A week of that and
        you'll know exactly where your protein sits without thinking about it.
      </p>

      <h2 style={S.h2}>The bottom line</h2>
      <p style={S.p}>
        Aim for 0.7–1g per pound of bodyweight. Go higher when cutting, go
        lower-end when bulking. Spread it across the day. Track it for a week
        to see where you really stand. That's genuinely all there is to it.
      </p>
    </BlogLayout>
  );
}

const S = {
  h1: {
    fontSize: "clamp(28px, 6vw, 40px)",
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: "-0.04em",
    lineHeight: 1.15,
    marginBottom: "1.5rem",
  },
  date: { fontSize: 13, color: "#bbb", fontWeight: 600, marginBottom: 8 },
  h2: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: "-0.03em",
    marginTop: "2.5rem",
    marginBottom: "0.75rem",
  },
  p: { fontSize: 16, color: "#444", lineHeight: 1.75, marginBottom: "1.25rem" },
  strong: { color: "#1a1a1a", fontWeight: 700 },
};
