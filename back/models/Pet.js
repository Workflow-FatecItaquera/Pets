const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor" },
  name: String,
  photo: String,
  type: String,
  breed: String,
  size: String,
  age: String,
  behavior: String,
  aestheticPreferences: String,
  notes: String,
  isActive: { type: Boolean, default: true }
});

const Pet = mongoose.model("Pet", PetSchema);
module.exports = Pet;