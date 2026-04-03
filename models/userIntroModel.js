import mongoose, { Schema } from "mongoose";

const userIntroSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      unique: true,
    },

    age:    { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    fitnessGoal: {
      type: String,
      enum: ["lose fat", "gain muscle", "strength"],
      required: true,
    },

    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },

    workoutDaysPerWeek: {
      type: Number,
      min: 1,
      max: 7,
      required: true,
    },

    // ── Free CalAI trial ──────────────────────────────────────────────────────
    freeTrialUsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.models.UserIntro ||
  mongoose.model("UserIntro", userIntroSchema);