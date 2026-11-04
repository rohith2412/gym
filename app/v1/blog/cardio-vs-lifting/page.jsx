import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "cardio-vs-lifting";
const TITLE = "Cardio vs Lifting: Which One Actually Burns More Fat?";
const DESC =
  "The cardio vs weights debate, settled. Why lifting wins for long-term fat loss, where cardio still matters, and the best approach for most people.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords:
    "cardio vs lifting, cardio or weights for fat loss, best exercise for weight loss, should I do cardio or weights, lifting for fat loss",
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
    datePublished: "2026-08-15",
    dateModified: "2026-08-15",
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
        Walk into any gym and you'll see two camps. The cardio people grinding
        away on treadmills. The lifters over by the squat rack. Both think the
        other group is doing it wrong.
      </p>
      <p style={S.p}>
        The truth is less dramatic: both work, but for different reasons. And
        if fat loss is the goal, one has a clear edge over time.
      </p>

      <h2 style={S.h2}>Cardio burns more during the session</h2>
      <p style={S.p}>
        An hour of running torches more calories than an hour of lifting.
        That's just physics — sustained elevated heart rate burns more fuel
        in the moment. A hard 45-minute run might burn 500–600 calories. A
        weights session, maybe 200–300.
      </p>
      <p style={S.p}>
        So cardio wins, right? Not so fast.
      </p>

      <h2 style={S.h2}>Lifting burns more after the session</h2>
      <p style={S.p}>
        Resistance training creates a longer "afterburn" (excess post-exercise
        oxygen consumption, if you want the science name). Your body keeps
        burning extra calories for hours after a weights session as it repairs
        muscle tissue.
      </p>
      <p style={S.p}>
        More importantly, muscle is metabolically expensive tissue. Every
        pound of muscle you carry burns roughly 6–7 calories per day just
        existing. That doesn't sound like much, but add 10 lbs of muscle over
        a year of training and you're burning an extra 60–70 calories a day
        doing absolutely nothing. Over a year, that adds up.
      </p>

      <h2 style={S.h2}>The real reason lifting wins for fat loss</h2>
      <p style={S.p}>
        When you diet to lose weight, your body doesn't just burn fat. It also
        burns muscle — unless you give it a strong signal to keep that muscle
        around. Lifting weights is that signal.
      </p>
      <p style={S.p}>
        People who lose weight with only cardio and dieting tend to end up
        "skinny fat" — lighter on the scale but soft, with less muscle than
        they started. People who lift while dieting lose the same amount of
        weight but keep (or even build) muscle, so they actually look and feel
        different at the end.
      </p>

      <h2 style={S.h2}>Where cardio still matters</h2>
      <p style={S.p}>
        Cardio is phenomenal for your heart, lungs, mood, and endurance. It
        also makes everyday life easier — climbing stairs, playing with your
        kids, not getting winded carrying groceries. These things matter even
        if they don't show up on a scale.
      </p>
      <p style={S.p}>
        Low-intensity cardio (walking, easy cycling) is also a great way to
        burn extra calories without taxing your recovery. A 30-minute walk
        burns 150+ calories, doesn't make you sore, and doesn't interfere
        with your lifting.
      </p>

      <h2 style={S.h2}>The best approach</h2>
      <p style={S.p}>
        Lift 3–4 times a week. Walk daily. Add 1–2 cardio sessions if you
        enjoy them or need the extra calorie burn. That's genuinely the best
        combination for fat loss, muscle retention, and general health.
      </p>
      <p style={S.p}>
        Track both in PocketGym — your lifts so you know you're progressing,
        and your meals so you know you're in a deficit. The gym and the kitchen
        have to work together. Doing one without the other is like rowing a
        boat with one oar.
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
