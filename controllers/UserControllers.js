const Patient = require("../models/PatientModel");
const Doctor = require("../models/DoctorModel");
const { ValidateBody } = require("../utils/helper");

const AddPatientController = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Basic validation (add more rules as needed)
    if (!ValidateBody([name, email])) {
        console.log(name, email);
      return res
        .status(400)
        .json({ error: "Name and email are required fields." });
    }

    const patient = await Patient.findOne({
      email: { $eq: email },
    });

    if (patient && patient.email === email) {
      return res.status(402).json({
        error: "Patient Already Exists",
      });
    }

    const newPatient = new Patient({
      name,
      email,
    });

    const savedPatient = await newPatient.save();

    res.status(201).json({
      message: "Patient added successfully!",
      patient: savedPatient,
    });
  } catch (error) {
    console.error("Error adding patient:", error);
    res.status(500).json({ error: "Failed to add patient." });
  }
};

const AddDoctorController = async (req, res) => {
  try {
    const { name, email, specialization } = req.body;


    if (!ValidateBody([name,email, specialization])) {
      return res
        .status(400)
        .json({ error: "Name, email, and specialization are required." });
    }

    const doctor = await Doctor.findOne({
      email: { $eq: email },
    });

    if(doctor && doctor.email === email){
        return res.status(402).json({
            error: "Doctor Already Exists",
          }); 
    }

    const newDoctor = new Doctor({
      name,
      email,
      specialization: specialization,
    });

    const savedDoctor = await newDoctor.save();

    res.status(201).json({
      message: "Doctor added successfully!",
      doctor: savedDoctor,
    });
  } catch (error) {
    console.error("Error adding doctor:", error);
    res.status(500).json({ error: "Failed to add doctor." });
  }
};

module.exports = { AddPatientController, AddDoctorController };
