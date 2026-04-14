export const dynamic = "force-dynamic"

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import UserIntro from "@/models/userIntroModel";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectdb } from "@/lib/connectdb";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectdb();

    // ✅ UPDATE EXISTING USER BY CORRECT ID
    const user = await UserIntro.findOneAndUpdate(
      { userId: session.user.id }, // 👈 THIS MATCHES YOUR DB
      {
        $set: {
          subscriptionStatus: "canceled"
        },
      },
      {
        new: true, // return updated document
      }
    );

    // ❌ if user doesn't exist
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription canceled successfully",
      user,
    });

  } catch (err) {
    console.error("CANCEL API ERROR:", err);

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}