// models/savedPlanModel.js
import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name:        String,
  muscleGroup: String,
  sets:        Number,
  reps:        String,
  rest:        String,
  tempo:       String,
  notes:       String,
}, { _id: false });

const daySchema = new mongoose.Schema({
  day:           String,
  label:         String,
  focus:         String,
  restDay:       Boolean,
  warmup:        String,
  cooldown:      String,
  estimatedTime: Number,
  exercises:     [exerciseSchema],
}, { _id: false });

const planSchema = new mongoose.Schema({
  planTitle:       String,
  planSummary:     String,
  weeklyVolume:    String,
  difficulty:      String,
  days:            [daySchema],
  progressionTips: [String],
  nutritionTips:   [String],
  weeklyGoals:     [String],
}, { _id: false });

const savedPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  plan:   { type: planSchema, required: true },
  savedAt:{ type: Date, default: Date.now },
});

export default mongoose.models.SavedPlan || mongoose.model("SavedPlan", savedPlanSchema);