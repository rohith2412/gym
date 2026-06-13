import mongoose from "mongoose";

const exerciseImageSchema = new mongoose.Schema({
  key:       { type: String, required: true, unique: true }, // normalized exercise name
  imageUrl:  { type: String, required: true },
  verified:  { type: Boolean, default: false },
  source:    { type: String, enum: ["pexels", "unsplash", "manual"], default: "pexels" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ExerciseImage ||
  mongoose.model("ExerciseImage", exerciseImageSchema);
