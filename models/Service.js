import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  icon: { type: String, required: true },
  duration: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
});

const Service = mongoose.model("Service", ServiceSchema);
export default Service;