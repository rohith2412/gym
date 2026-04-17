// models/userIntroModel.js
import mongoose, { Schema } from "mongoose";

const userIntroSchema = new Schema({
  userId:              { type: String, required: true, unique: true },
  gender:              String,
  age:                 Number,
  height:              Number,
  weight:              Number,
  fitnessGoal:         String,
  experienceLevel:     String,
  workoutDaysPerWeek:  Number,

  // ── Subscription ──────────────────────────────────────────
  isSubscribed:        { type: Boolean, default: false },
  stripeCustomerId:    String,
  stripeSubscriptionId:String,
  subscriptionStatus:  String,
  currentPeriodEnd:    Date,

  // Add inside userIntroSchema — after workoutDaysPerWeek
  customCalories: Number,
  customProtein:  Number,
  customCarbs:    Number,
  customFat:      Number,
  customFiber:    Number,

  // ── Free trial ────────────────────────────────────────────
  freeTrialUsed:       { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.UserIntro || mongoose.model("UserIntro", userIntroSchema);