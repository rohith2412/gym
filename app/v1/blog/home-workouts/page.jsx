import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "home-workouts";
const TITLE = "Home Workouts That Actually Build Muscle";
const DESC =
  "You can build real muscle at home with no equipment — if you train smart. Progressive overload without a barbell, and when it stops being enough.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: "home workout muscle building, bodyweight exercises for muscle, no equipment workout, home gym alternatives, calisthenics for muscle",
  alternates: { canonical: `${BASE_URL}/v1/blog/${SLUG}` },
  openGraph: { title: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, siteName: "YourPocketGym", type: "article" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

function JsonLd() {
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESC, url: `${BASE_URL}/v1/blog/${SLUG}`, publisher: { "@type": "Organization", name: "YourPocketGym", url: BASE_URL }, datePublished: "2026-09-15", dateModified: "2026-09-15" };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default function Page() {
  return (
    <BlogLayout>
      <JsonLd />
      <p style={S.date}>September 2026</p>
      <h1 style={S.h1}>{TITLE}</h1>

      <p style={S.p}>
        "You can't build real muscle without a gym." You hear this a lot.
        It's wrong — but it's not completely wrong. You can build a solid
        physique with bodyweight training, especially in the first year or
        two. After that, you'll need to get creative or get to a gym.
      </p>

      <h2 style={S.h2}>The principle doesn't change</h2>
      <p style={S.p}>
        Muscle grows when you push it close to failure with enough volume over
        time. The barbell is the easiest tool for that because you can add
        2.5kg each week. At home, you need to use different levers: harder
        variations, slower tempos, more reps, or less rest.
      </p>
      <p style={S.p}>
        50 push-ups is mostly cardio. 10 slow, controlled push-ups with a
        3-second pause at the bottom, done until you can't do another one —
        that builds muscle.
      </p>

      <h2 style={S.h2}>The exercises that work</h2>
      <p style={S.p}>
        Push-ups and their variations cover your chest, shoulders, and
        triceps. Start with regular push-ups, progress to diamond push-ups,
        then deficit push-ups (hands on books or blocks for extra range), then
        pike push-ups for shoulders.
      </p>
      <p style={S.p}>
        Pull-ups are king for back and biceps. A $30 doorframe pull-up bar
        is the single best home gym investment you can make. If you can't do
        a pull-up yet, start with dead hangs and slow negatives (jump to the
        top, lower yourself as slowly as possible).
      </p>
      <p style={S.p}>
        Bulgarian split squats for legs. One foot on a chair behind you,
        squat down on the front leg. These are brutal with just bodyweight.
        Add a backpack full of books when they get easy.
      </p>
      <p style={S.p}>
        Dips between two chairs for chest and triceps. Be careful with
        stability — the chairs need to be solid.
      </p>

      <h2 style={S.h2}>How to progress without adding weight</h2>
      <p style={S.p}>
        Since you can't slap more plates on, you progress differently. Slower
        reps (3 seconds down, 1 second up). Pauses at the hardest point.
        1.5 reps (go down, come halfway up, go back down, then all the way
        up — that's one rep). Single-limb variations. Or just add reps until
        you can do 15–20, then move to a harder version for 8–10.
      </p>

      <h2 style={S.h2}>The honest limits</h2>
      <p style={S.p}>
        Bodyweight training has a ceiling, especially for legs. Once you can
        do 20 Bulgarian split squats easily, you need external load to keep
        growing. A set of adjustable dumbbells or resistance bands extends
        the runway significantly.
      </p>
      <p style={S.p}>
        Track your reps and variations in PocketGym the same way you'd track
        barbell weights. "Push-ups: 3×12" this week, "Push-ups: 3×15" next
        week — progression is progression regardless of the tool.
      </p>

      <h2 style={S.h2}>It beats doing nothing</h2>
      <p style={S.p}>
        The best workout is one you actually do. If the gym isn't an option
        right now — money, location, time — a smart bodyweight routine three
        days a week will build real muscle for your first year. After that,
        figure out how to add load. But don't wait for the "perfect" setup to
        start.
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
