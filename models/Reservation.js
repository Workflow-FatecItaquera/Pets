import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
  title: String,
  notes: String,
  startDate: Date,
  estimatedDuration: Number,
  recurrence: {
    type: { type: String },
    active: Boolean
  },
  price: Number,
  status: String,
  active: { type: Boolean, default: true }
});

const Reservation = mongoose.model("Reservation",ReservationSchema);
export default Reservation;
