import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  timestamp: { type: Date, default: Date.now },
  message: String
});

const Log = mongoose.model("Log", LogSchema);
export default Log;