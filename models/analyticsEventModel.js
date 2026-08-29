// Lightweight product analytics — one row per tracked event.
//
// Deliberately small: a type, an optional screen name, and a timestamp. No
// device fingerprints, no GPS, no free-text payloads. Country comes from the
// region the user picked during onboarding, not from their IP or location
// services.

import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    // "app_open" | "screen_view"
    type: { type: String, required: true, index: true },
    // Route name for screen_view, e.g. "nutrition". Absent for app_open.
    screen: { type: String },
    at: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: false },
);

// Most queries are "this user's recent events" or "events since X".
analyticsEventSchema.index({ userId: 1, at: -1 });

// Keep the collection bounded — events older than 90 days expire on their own,
// so this never becomes an unbounded write-only table.
analyticsEventSchema.index({ at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.models.analyticsEvent ||
  mongoose.model("analyticsEvent", analyticsEventSchema);
