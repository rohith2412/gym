// app/v1/recipes/page.jsx - server component for SEO metadata

const BASE_URL = "https://yourpocketgym.com";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "AI High Protein Recipe Generator - Recipes for Your Goal | YourPocketGym",
  description:
    "Generate personalised high protein recipes for muscle gain or fat loss in seconds. AI-powered meal ideas with full macros - calories, protein, carbs and fat.",
  keywords:
    "high protein recipes, ai recipe generator, muscle gain recipes, fat loss meals, high protein meal ideas, protein recipes ai",
  alternates: {
    canonical: `${BASE_URL}/v1/recipes`,
  },
  openGraph: {
    title: "AI High Protein Recipe Generator",
    description: "Pick your goal, get a personalised high protein recipe with full macros instantly.",
    type: "website",
    url: `${BASE_URL}/v1/recipes`,
    siteName: "YourPocketGym",
    images: [{ url: `${BASE_URL}/og-recipes.png`, width: 1200, height: 630, alt: "AI High Protein Recipe Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI High Protein Recipe Generator",
    description: "Pick your goal, get a personalised high protein recipe with full macros instantly.",
    images: [`${BASE_URL}/og-recipes.png`],
  },
};

function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/v1/recipes`,
        url: `${BASE_URL}/v1/recipes`,
        name: "AI High Protein Recipe Generator",
        description: "Generate personalised high protein recipes for muscle gain or fat loss with full macro breakdown.",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How much protein should I eat to build muscle?",
            acceptedAnswer: { "@type": "Answer", text: "Most research suggests 1.6–2.2g of protein per kg of bodyweight per day for muscle gain. Our recipes target 40g+ protein per meal to help you hit that target." },
          },
          {
            "@type": "Question",
            name: "What are the best high protein foods for fat loss?",
            acceptedAnswer: { "@type": "Answer", text: "Chicken breast, Greek yogurt, eggs, cottage cheese, tuna, and legumes are excellent high protein, low calorie foods for fat loss. Our AI recipes prioritise these ingredients." },
          },
          {
            "@type": "Question",
            name: "Can I eat high protein meals on a calorie deficit?",
            acceptedAnswer: { "@type": "Answer", text: "Yes - high protein meals are ideal for fat loss because protein keeps you fuller for longer and helps preserve muscle mass while in a calorie deficit." },
          },
        ],
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

import RecipesClient from "./RecipesClient";

export default function RecipesPage() {
  return (
    <>
      <JsonLd />
      <RecipesClient />
    </>
  );
}