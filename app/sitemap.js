const BASE_URL = "https://www.yourpocketgym.com";

export default function sitemap() {
  const blogPosts = [
    "protein-intake-guide",
    "calorie-deficit-tips",
    "beginner-gym-mistakes",
    "easy-meal-prep",
    "scale-weight-fluctuations",
    "cardio-vs-lifting",
    "read-nutrition-labels",
    "lean-bulk-guide",
    "tracking-macros-guide",
    "best-workout-split",
    "rest-day-guide",
    "creatine-guide",
    "breaking-plateaus",
    "eating-out-on-a-diet",
    "home-workouts",
    "sleep-and-gains",
    "water-intake-guide",
    "morning-vs-evening-gym",
    "body-recomposition",
    "sugar-and-fat-loss",
  ];

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/v1/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/v1/blog/caloriesAI`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...blogPosts.map((slug) => ({
      url: `${BASE_URL}/v1/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
    {
      url: `${BASE_URL}/v1/recipes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/v1/ai-trainer`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/v1/tracking`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/v1/nutrition`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
