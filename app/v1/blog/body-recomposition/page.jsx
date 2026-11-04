import BlogLayout from "@/components/BlogLayout";

const BASE_URL = "https://www.yourpocketgym.com";
const SLUG = "body-recomposition";
const TITLE = "Can You Lose Fat and Build Muscle at the Same Time?";
const DESC =
  "Body recomposition is real — but it's not for everyone. Who it works for, how to set it up, and when you're better off picking one goal.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: "body recomposition, lose fat gain muscle, recomp diet, build muscle while losing fat, body recomp guide",
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
        The internet can't agree on this. One camp says body recomposition —
        losing fat while gaining muscle simultaneously — is impossible.
        Another camp says it's the only smart approach. Neither is right.
      </p>
      <p style={S.p}>
        Recomp is real. It's just slow, and it doesn't work equally well for
        everyone.
      </p>

      <h2 style={S.h2}>Who it works best for</h2>
      <p style={S.p}>
        If you're in one of these buckets, recomp is a legitimate strategy:
      </p>
      <p style={S.p}>
        <strong style={S.strong}>Beginners.</strong> If you're new to lifting,
        your body is primed to build muscle fast even in a calorie deficit.
        "Newbie gains" are real and they last 6–12 months. This is the
        golden window for recomp.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>People returning after a break.</strong> If
        you used to train and took time off, muscle memory is a real
        phenomenon. Your body can rebuild lost muscle much faster than it
        built it originally, even while losing fat.
      </p>
      <p style={S.p}>
        <strong style={S.strong}>People with higher body fat.</strong> If
        you're carrying a lot of extra fat, your body has plenty of stored
        energy to fuel muscle growth even without a calorie surplus.
      </p>

      <h2 style={S.h2}>How to set it up</h2>
      <p style={S.p}>
        Eat at maintenance calories or a very slight deficit (100–200 below
        maintenance). Push protein high — closer to 1g per pound of
        bodyweight. Train hard with progressive overload. Sleep well.
      </p>
      <p style={S.p}>
        The scale might not move much, and that's the point. You're replacing
        fat with muscle, which weighs the same. Go by the mirror, how your
        clothes fit, and your training performance — not the number on the
        scale.
      </p>

      <h2 style={S.h2}>Why it's slow</h2>
      <p style={S.p}>
        Building muscle is a slow process. Losing fat is a slow process. Doing
        both at once is glacially slow because neither process is running at
        full speed. A dedicated bulk builds muscle faster. A dedicated cut
        loses fat faster. Recomp does both, but at a fraction of the rate.
      </p>
      <p style={S.p}>
        Over six months you might lose 5 lbs of fat and gain 5 lbs of muscle.
        The scale says zero change. But you look completely different. You
        just have to be patient enough to let it work.
      </p>

      <h2 style={S.h2}>When to just pick one</h2>
      <p style={S.p}>
        If you've been training consistently for 2+ years, recomp becomes
        painfully slow. Your body has already captured the easy gains. At
        that point, dedicated bulk and cut cycles are more efficient — spend
        a few months in a surplus building muscle, then a few months in a
        deficit stripping fat.
      </p>
      <p style={S.p}>
        Also, if you have a deadline (wedding, holiday, competition), pick
        one goal and focus. Recomp is a long game, not a short one.
      </p>

      <h2 style={S.h2}>Track the right things</h2>
      <p style={S.p}>
        Since the scale won't tell you much during a recomp, track what
        matters: your lifts (are they going up?), your food (are you hitting
        protein targets?), and your appearance. PocketGym handles the first
        two — log your sets, snap your meals — so you have actual data
        instead of feelings. Take a progress photo every few weeks. The
        difference over three months will surprise you.
      </p>
    </BlogLayout>
  );
}

const S = {
  h1: { fontSize: 32, fontWeight: 800, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "2rem" },
  date: { fontSize: 13, color: "#999", fontWeight: 500, marginBottom: 8 },
  h2: { fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: "-0.03em", marginTop: "3rem", marginBottom: "0.75rem" },
  p: { fontSize: 17, color: "#333", lineHeight: 1.8, marginBottom: "1.5rem" },
  strong: { color: "#111", fontWeight: 700 },
};
