import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "breaking-plateaus";
const TITLE = "Your Lifts Stopped Going Up. Now What?";
const DESC =
  "Strength plateaus happen to everyone. Here's how to tell if it's programming, recovery, or food — and what to change first.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: "strength plateau, lifts not increasing, how to break a plateau, progressive overload stalled, gym plateau",
  alternates: { canonical: `${BASE_URL}/v1/blog/${SLUG}` },
  openGraph: { title: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, siteName: "YourPocketGym", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

function JsonLd() {
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, publisher: { "@type": "Organization", name: "YourPocketGym", url: BASE_URL }, datePublished: "2026-11-01", dateModified: "2026-11-01" };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function Page() {
  return (
    <BlogLayout>
      <JsonLd />
      <p style={S.date}>November 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        You've been adding weight to the bar every week for months. Then one
        day it stops. You try again next week — same weight, same reps, maybe
        fewer. Welcome to your first plateau. It's not the end of your
        progress. It's the end of easy progress.
      </p>

      <h2 style={S.h2}>Check the obvious stuff first</h2>
      <p style={S.p}>
        Before you change your program, ask yourself three questions. Are you
        sleeping enough? Are you eating enough? Are you actually recovering
        between sessions?
      </p>
      <p style={S.p}>
        Most plateaus aren't training problems — they're lifestyle problems
        wearing a training costume. You can't expect your bench press to go up
        when you're sleeping five hours, eating at a deficit, and training six
        days a week. Something has to give.
      </p>

      <h2 style={S.h2}>Add reps before adding weight</h2>
      <p style={S.p}>
        If you're stuck at 80kg for 3 sets of 5, don't keep trying 82.5kg and
        failing. Stay at 80kg and work up to 3 sets of 7 or 8. Once you own
        that weight for higher reps, the jump to 82.5kg for 5 becomes much
        more manageable.
      </p>
      <p style={S.p}>
        This is called double progression and it's the simplest way to keep
        moving forward when straight weight jumps stop working.
      </p>

      <h2 style={S.h2}>Take a deload week</h2>
      <p style={S.p}>
        Drop your weights by 40–50% for a full week. Same exercises, same
        structure, lighter load. It feels like wasting a week. It's not.
      </p>
      <p style={S.p}>
        Accumulated fatigue is sneaky. You don't always feel overtrained — you
        just feel stuck. A deload lets your tendons, joints, and nervous
        system catch up with your muscles. Most people come back from a deload
        and hit new PRs within two weeks.
      </p>

      <h2 style={S.h2}>Add volume, then pull it back</h2>
      <p style={S.p}>
        If you've been doing 3 sets of each exercise, try bumping to 4 sets
        for a few weeks. More total work gives your muscles a new stimulus.
        But don't leave it there forever — run 4 sets for 4–6 weeks, deload,
        then drop back to 3 sets with heavier weight.
      </p>

      <h2 style={S.h2}>Look at your training log</h2>
      <p style={S.p}>
        This is where tracking pays off. If you can look back at three months
        of sessions, you can spot patterns. Maybe you're only stalling on
        pressing movements. Maybe your squat goes up when you eat more. Maybe
        your deadlift is fine but bench has been flat for eight weeks.
      </p>
      <p style={S.p}>
        PocketGym's workout log gives you this history on a screen. Without it,
        you're debugging without error messages.
      </p>

      <h2 style={S.h2}>Plateaus are normal</h2>
      <p style={S.p}>
        Beginners add weight every session. Intermediates add weight every few
        weeks. Advanced lifters fight for years to add 5kg to a lift. The
        closer you get to your genetic potential, the slower progress gets.
        That's not a problem — it's the nature of the thing. Adjust your
        expectations, keep showing up, and the numbers will keep moving. Just
        not as fast as they used to.
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
