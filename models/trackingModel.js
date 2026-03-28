import mongoose from "mongoose";

const setSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, required: true }, 
});

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  muscleGroup: { type: String },  
  sets: [setSchema],
});

const trackingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    exercises: [exerciseSchema],
    notes: { type: String },
  },
  { timestamps: true }
);


trackingSchema.index({ userId: 1, date: -1 });

export default mongoose.models.tracking ||
  mongoose.model("tracking", trackingSchema);