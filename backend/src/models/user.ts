import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    isActif: { type: Boolean, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    invitationToken: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);