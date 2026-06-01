const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  picture: String
});

const User = mongoose.model("User",UserSchema);
module.exports = User;