import mongoose, { Schema } from "mongoose";

const authSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  }
}, { timestamps: true });

export default mongoose.models.Auth || mongoose.model("Auth", authSchema);
