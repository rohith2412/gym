import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "rest-day-guide";
const TITLE = "What to Actually Do on Rest Days";
const DESC =
  "Rest days don't mean lying on the couch all day. Light movement, sleep, and eating enough are what make your training days count.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: "rest day tips, active recovery, what to do on rest days, recovery for muscle growth, gym rest day",
  alternates: { canonical: `${BASE_URL}/v1/blog/${SLUG}` },
  openGraph: { title: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, siteName: "YourPocketGym", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

function JsonLd() {
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, publisher: { "@type": "Organization", name: "YourPocketGym", url: BASE_URL }, datePublished: "2026-11-04", dateModified: "2026-11-04" };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function Page() {
  return (
    <BlogLayout>
      <JsonLd />
      <p style={S.date}>November 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        The biggest misconception about rest days is that "rest" means doing
        nothing. It doesn't. It means not training. There's a difference.
      </p>
      <p style={S.p}>
        Your muscles grow during recovery, not during the workout. The workout
        is the stimulus. Sleep, food, and low-level movement are what turn that
        stimulus into actual progress.
      </p>

      <h2 style={S.h2}>Move, just not hard</h2>
      <p style={S.p}>
        A 20–30 minute walk is probably the single best rest day activity. It
        gets blood flowing to sore muscles, helps with digestion, reduces
        stress, and burns a few extra calories without taxing your recovery.
        You'll feel better than if you'd stayed on the couch.
      </p>
      <p style={S.p}>
        Light stretching or a casual yoga session works too. The point isn't
        to get a workout in through the back door — it's to stay mobile so
        you're not hobbling into the gym on Monday like you just aged 30 years.
      </p>

      <h2 style={S.h2}>Don't cut your food</h2>
      <p style={S.p}>
        This is where a lot of people mess up. "I didn't train today so I should
        eat less." No. Your body is repairing muscle tissue today. That takes
        energy and protein. If you slash your calories on rest days, you're
        undermining the exact process you trained for.
      </p>
      <p style={S.p}>
        Keep your protein the same. Keep your total calories close to your
        training day target, maybe 100–200 less at most. The difference is
        marginal and not worth overthinking.
      </p>

      <h2 style={S.h2}>Sleep like you mean it</h2>
      <p style={S.p}>
        If there's one day to get eight full hours, it's the day after a hard
        training session. Growth hormone peaks during deep sleep. Cortisol
        drops. Muscle protein synthesis is humming. All of that requires
        you to actually sleep, not scroll your phone until 1am.
      </p>

      <h2 style={S.h2}>How many rest days per week?</h2>
      <p style={S.p}>
        Most people do well with 2–3 rest days per week. If you're training
        hard on your gym days — actually pushing close to failure — your body
        needs the recovery. More isn't always more.
      </p>
      <p style={S.p}>
        If you feel run down, your lifts are going backwards, and you're
        dreading the gym, you probably need more rest, not a harder program.
        Use PocketGym to track your training volume and spot when performance
        starts dropping — that's your body asking for a break.
      </p>

      <h2 style={S.h2}>The short version</h2>
      <p style={S.p}>
        Go for a walk. Eat enough protein. Sleep well. Don't feel guilty about
        not being in the gym — recovery is part of the process, not a pause
        from it.
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
