import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "creatine-guide";
const TITLE = "Creatine: The Only Supplement Worth Your Money";
const DESC =
  "Creatine monohydrate is cheap, safe, and actually works. Here's what it does, how to take it, and why most other supplements are a waste.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: "creatine guide, creatine monohydrate, does creatine work, how to take creatine, best gym supplement",
  alternates: { canonical: `${BASE_URL}/v1/blog/${SLUG}` },
  openGraph: { title: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, siteName: "YourPocketGym", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

function JsonLd() {
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, publisher: { "@type": "Organization", name: "YourPocketGym", url: BASE_URL }, datePublished: "2026-11-02", dateModified: "2026-11-02" };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function Page() {
  return (
    <BlogLayout>
      <JsonLd />
      <p style={S.date}>November 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        The supplement industry is worth billions, and almost all of it is
        garbage. Fat burners, testosterone boosters, BCAAs — marketing dressed
        up as science. But creatine is the exception. It's the single most
        researched sports supplement in history, and it genuinely works.
      </p>

      <h2 style={S.h2}>What it actually does</h2>
      <p style={S.p}>
        Your muscles use a molecule called ATP for short, explosive efforts —
        the first few seconds of a heavy squat, a sprint, or a set of bench
        press. Creatine helps your body regenerate ATP faster, which means you
        can squeeze out an extra rep or two before fatigue hits.
      </p>
      <p style={S.p}>
        Over weeks and months, those extra reps add up to more volume, more
        progressive overload, and more muscle. It's not magic — it's a small
        edge that compounds over time.
      </p>

      <h2 style={S.h2}>How to take it</h2>
      <p style={S.p}>
        5 grams per day. Every day, including rest days. Mix it into water,
        coffee, a shake — it doesn't matter. Timing doesn't matter either.
        Don't overthink this.
      </p>
      <p style={S.p}>
        You'll read about "loading phases" (20g/day for a week). It works but
        it's unnecessary. Your muscles will be fully saturated after 3–4 weeks
        of 5g/day regardless. Loading just gets you there faster and gives
        some people stomach issues.
      </p>

      <h2 style={S.h2}>Creatine monohydrate. That's it.</h2>
      <p style={S.p}>
        Companies sell creatine HCL, buffered creatine, creatine ethyl ester,
        micronised creatine — all at a premium. None of them are proven to
        work better than plain creatine monohydrate, which is the cheapest
        option. Buy whatever unflavoured monohydrate costs the least per gram.
      </p>

      <h2 style={S.h2}>The water weight thing</h2>
      <p style={S.p}>
        Yes, creatine pulls water into your muscle cells. You might gain 2–4
        lbs in the first couple of weeks. This is not fat. It's
        intramuscular water, and it actually makes your muscles look slightly
        fuller. If you're tracking your weight in PocketGym, just know that
        the initial bump is water, not body fat.
      </p>

      <h2 style={S.h2}>Is it safe?</h2>
      <p style={S.p}>
        Creatine has been studied in hundreds of trials over decades. There's
        no credible evidence that it damages your kidneys, liver, or anything
        else in healthy people. The "creatine is bad for your kidneys" myth
        comes from a misunderstanding of creatinine (a metabolic byproduct)
        levels in blood tests.
      </p>
      <p style={S.p}>
        If you have a pre-existing kidney condition, talk to your doctor. For
        everyone else, it's as safe as supplements get.
      </p>

      <h2 style={S.h2}>What about everything else?</h2>
      <p style={S.p}>
        Protein powder is fine if you can't hit your protein target through
        food — it's just convenient protein, not a supplement in the "magic
        powder" sense. Caffeine works for training energy. Vitamin D if you
        don't get much sun.
      </p>
      <p style={S.p}>
        Beyond that, save your money. The marginal return on most supplements
        is so small that you'd get more out of sleeping an extra hour or
        eating one more high-protein meal per day. The basics are boring but
        they're what actually moves the needle.
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
