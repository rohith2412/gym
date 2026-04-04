// app/v1/blog/caloriesAI/page.jsx

import CaloriesAIClient from "@/components/CaloriesAIClient";

const BASE_URL = "https://yourpocketgym.com"; // ← change to your real domain

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "AI Calorie Tracker - Snap a Photo, Get Instant Macros | YourPocketGym",
  description:
    "The fastest AI calorie counter. Just take a photo of your meal and get instant calories, protein, carbs and fat. No manual logging. Try it free - no credit card needed.",
  keywords:
    "ai calorie tracker, photo calorie counter, calorie calculator, macro tracker, food tracker ai, instant calorie count, calorie counter app, ai food tracker",
  alternates: {
    canonical: `${BASE_URL}/v1/blog/caloriesAI`,
  },
  openGraph: {
    title: "AI Calorie Tracker - Snap a Photo, Get Instant Macros",
    description:
      "Take a photo of any meal and get instant nutritional breakdown powered by AI. Try free - no credit card.",
    type: "website",
    url: `${BASE_URL}/v1/blog/caloriesAI`,
    siteName: "YourPocketGym",
    images: [
      {
        url: `${BASE_URL}/og-calorie-tracker.png`, // ← create a 1200×630 OG image
        width: 1200,
        height: 630,
        alt: "AI Calorie Tracker - Snap a photo, get instant macros",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Calorie Tracker - Snap a Photo, Get Instant Macros",
    description: "Take a photo of any meal and get instant nutritional breakdown powered by AI.",
    images: [`${BASE_URL}/og-calorie-tracker.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// JSON-LD structured data - helps Google show rich results
function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/v1/blog/caloriesAI`,
        url: `${BASE_URL}/v1/blog/caloriesAI`,
        name: "AI Calorie Tracker - Snap a Photo, Get Instant Macros",
        description:
          "The fastest AI calorie counter. Take a photo of your meal and get instant calories, protein, carbs and fat.",
        isPartOf: { "@id": BASE_URL },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: `${BASE_URL}/og-calorie-tracker.png`,
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "YourPocketGym AI Calorie Tracker",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web, iOS, Android",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free trial - one AI meal analysis included",
        },
        description:
          "AI-powered calorie tracker. Snap a photo of any meal and get instant macros - calories, protein, carbs and fat - powered by GPT-4o Vision.",
        featureList: [
          "Photo-based calorie counting",
          "Instant macro breakdown",
          "Protein, carbs, fat and fiber tracking",
          "Daily calorie goal tracking",
          "AI-powered food recognition",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How accurate is the AI calorie tracker?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Our AI uses GPT-4o Vision, which achieves high accuracy on common foods. Estimates may vary on mixed dishes or non-standard portions - the AI flags lower-confidence items.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need to manually enter portion sizes?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. The AI estimates portion sizes from the photo automatically. You can see each item's portion guess in the breakdown.",
            },
          },
          {
            "@type": "Question",
            name: "What foods can it recognise?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The AI recognises thousands of foods including restaurant meals, fast food, home cooking, packaged goods and ethnic cuisines from around the world.",
            },
          },
          {
            "@type": "Question",
            name: "Is this better than MyFitnessPal?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "For photo-based logging yes - no manual search, no barcode scanning. Just snap and go. For long-term tracking we combine it with a full dashboard.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function CaloriesAIPage() {
  return (
    <>
      <JsonLd />
      <CaloriesAIClient />
    </>
  );
}