// Per-user snapshot of the iOS app's local state (Pro-only sync).
// Whole-blob, last-write-wins — the client sends its full snapshot on push,
// and reads it back on pull. Small enough (routines/food/water/weights) that
// per-record CRDT isn't worth it yet.

import mongoose from "mongoose";

const syncSnapshotSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    // Arbitrary JSON blob — the client owns the shape. Kept as Mixed so we can
    // evolve the on-device schema without a server migration.
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    // ISO client wall-clock at push time; server also stamps updatedAt.
    clientUpdatedAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.syncSnapshot ||
  mongoose.model("syncSnapshot", syncSnapshotSchema);
