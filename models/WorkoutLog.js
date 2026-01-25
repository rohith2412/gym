// models/WorkoutLog.js
import mongoose, { Schema } from "mongoose";

const workoutLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
    muscleGroup: { type: String, required: true },  
    exercise: { type: String, required: true },    
    sets: [
      {
        weight: { type: Number, required: true },
        reps: { type: Number, required: true },
      },
    ],
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.WorkoutLog ||
  mongoose.model("WorkoutLog", workoutLogSchema);
