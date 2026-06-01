import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  picture: String
});

const User = mongoose.model("User",UserSchema);

export default User;