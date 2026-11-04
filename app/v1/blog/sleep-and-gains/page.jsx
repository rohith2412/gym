import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "sleep-and-gains";
const TITLE = "Sleep Is Doing More for Your Gains Than Your Pre-Workout";
const DESC =
  "Sleep is the most underrated factor in building muscle and losing fat. What happens when you sleep, why 6 hours isn't enough, and how to fix it.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: "sleep and muscle growth, sleep for gym performance, how sleep affects gains, sleep and recovery, sleep weight loss",
  alternates: { canonical: `${BASE_URL}/v1/blog/${SLUG}` },
  openGraph: { title: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, siteName: "YourPocketGym", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

function JsonLd() {
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, publisher: { "@type": "Organization", name: "YourPocketGym", url: BASE_URL }, datePublished: "2026-10-05", dateModified: "2026-10-05" };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function Page() {
  return (
    <BlogLayout>
      <JsonLd />
      <p style={S.date}>October 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        People will spend $50/month on supplements, obsess over meal timing,
        and debate whether to train at 6am or 6pm — then sleep five and a half
        hours and wonder why they're not making progress. Sleep isn't a
        nice-to-have. It's the foundation everything else sits on.
      </p>

      <h2 style={S.h2}>What happens while you sleep</h2>
      <p style={S.p}>
        Growth hormone release peaks during deep sleep. This is when your body
        does most of its muscle repair and tissue building. Cut your sleep
        short and you're cutting into the exact window where gains happen.
      </p>
      <p style={S.p}>
        Testosterone also drops measurably with poor sleep. One study found
        that a week of 5-hour nights reduced testosterone levels by 10–15% in
        young men. That's a bigger hormonal hit than most "test booster"
        supplements claim to fix.
      </p>

      <h2 style={S.h2}>Sleep and fat loss</h2>
      <p style={S.p}>
        Under-sleeping makes dieting harder in every way. Hunger hormones
        spike — ghrelin goes up, leptin goes down. You crave high-calorie
        foods. Your willpower is lower. And your body preferentially burns
        muscle instead of fat when it's sleep-deprived and in a deficit.
      </p>
      <p style={S.p}>
        In one study, dieters who slept 8.5 hours lost mostly fat. The same
        dieters sleeping 5.5 hours lost mostly muscle. Same calorie deficit,
        completely different outcomes.
      </p>

      <h2 style={S.h2}>How much is enough</h2>
      <p style={S.p}>
        Seven to nine hours for most adults. If you're training hard, lean
        toward nine. If you need an alarm clock to wake up, you're not sleeping
        enough. If you fall asleep within two minutes of hitting the pillow,
        you're probably sleep-deprived (that's exhaustion, not good sleep
        hygiene).
      </p>

      <h2 style={S.h2}>Practical things that actually help</h2>
      <p style={S.p}>
        Keep your room cold — 18–19°C is the sweet spot for most people.
        Stop looking at screens 30–60 minutes before bed (or at least use a
        blue light filter). Don't have caffeine after 2pm — its half-life is
        5–6 hours, meaning half the caffeine from your 3pm coffee is still in
        your system at 9pm.
      </p>
      <p style={S.p}>
        Go to bed and wake up at roughly the same time every day, including
        weekends. Your circadian rhythm doesn't know it's Saturday.
      </p>

      <h2 style={S.h2}>Track the thing that matters</h2>
      <p style={S.p}>
        Most people track sets, reps, and meals but never look at their sleep.
        If your lifts are stalling and your diet is dialled in, sleep is almost
        always the missing piece. Even just noting your hours in PocketGym
        alongside your training gives you a pattern to work with — you'll
        start seeing that your best sessions follow your best nights.
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
