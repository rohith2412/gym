import { connectdb } from "@/lib/connectdb";
import userIntroModel from "@/models/userIntroModel";


export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const intro = await userIntroModel.findOne({ userId: session.user.id }); // only THEIR data
  return Response.json({ success: true, data: intro });
}