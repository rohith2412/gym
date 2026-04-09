import mongoose from "mongoose";

const credentialAuthSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const CredentialAuth =
  mongoose.models.CredentialAuth ||
  mongoose.model("CredentialAuth", credentialAuthSchema);

export default CredentialAuth;