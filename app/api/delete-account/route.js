export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import { getAuthUser } from "@/lib/getAuthUser";
import Auth from "@/models/authModel";
import CredentialAuth from "@/models/credentialAuthModel";
import MealLog from "@/models/mealLogModel";
import TrackingLog from "@/models/trackingModel";
import UserIntro from "@/models/userIntroModel";
import Recipe from "@/models/recipeModel";
import SavedPlan from "@/models/savedPlanModel";

export async function DELETE(req) {
  try {
    const user = await getAuthUser(req);

    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectdb();

    const userId = user.id;

    // Delete all user data across every collection in parallel
    await Promise.all([
      Auth.deleteOne({ _id: userId }),
      CredentialAuth.deleteOne({ _id: userId }),
      UserIntro.deleteOne({ userId }),
      MealLog.deleteMany({ userId }),
      TrackingLog.deleteMany({ userId }),
      Recipe.deleteMany({ userId }),
      SavedPlan.deleteMany({ userId }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Account and all associated data deleted successfully",
    });

  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
