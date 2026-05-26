import mongoose from "mongoose";

const TutorSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  isActive: { type: Boolean, default: true }
});

const Tutor = mongoose.model("Tutor", TutorSchema);
export default Tutor;