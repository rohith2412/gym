// app/robots.js
// Next.js auto-generates /robots.txt from this file

const BASE_URL = "https://yourpocketgym.com"; // ← change to your real domain

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/v1/dashboard",
          "/v1/tracking",
          "/v1/nutrition",
          "/v1/profile",
          "/v1/StartersIntro",
          "/api/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}