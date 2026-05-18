import MealLog from "@/models/mealLogModel";

const DAILY_SCAN_LIMIT = 3; // AI image scans per user per day

/**
 * Checks if the user has exceeded their daily AI scan limit.
 * Counts meal-log docs created today via AI vision (not manual entries).
 *
 * @returns {{ allowed: boolean, used: number, limit: number }}
 */
export async function checkScanRateLimit(userId, localDate) {
  const query = {
    userId,
    // Only count AI scans, not manual macro entries
    aiNotes: { $exists: true, $ne: "Macros entered manually" },
    $or: [
      { localDate },
      {
        localDate: { $exists: false },
        date: {
          $gte: new Date(`${localDate}T00:00:00.000Z`),
          $lte: new Date(`${localDate}T23:59:59.999Z`),
        },
      },
    ],
  };

  const used = await MealLog.collection.countDocuments(query);

  return {
    allowed: used < DAILY_SCAN_LIMIT,
    used,
    limit: DAILY_SCAN_LIMIT,
  };
}
