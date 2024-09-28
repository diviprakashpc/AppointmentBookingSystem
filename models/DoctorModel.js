const mongoose = require("mongoose");


const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Make email unique
  specialization: { type: String, required: true },
  // Add other fields to the doctor schema
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
