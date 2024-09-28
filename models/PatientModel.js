const mongoose = require("mongoose");

const PatientSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const Patient = mongoose.model("Patient", PatientSchema); // Patient Model

module.exports = Patient;
