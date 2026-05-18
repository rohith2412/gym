// Receipt verification is handled by RevenueCat — no backend code needed.
export async function POST() {
  return Response.json({ error: "Use RevenueCat SDK for purchase verification." }, { status: 410 });
}
