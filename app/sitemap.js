const BASE_URL = "https://yourpocketgym.com";

export default function sitemap() {
  return [
    { url: BASE_URL,                               lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE_URL}/v1/blog/caloriesAI`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE_URL}/v1/recipes`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE_URL}/v1/ai-trainer`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/v1/tracking`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/v1/nutrition`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
  ];
}