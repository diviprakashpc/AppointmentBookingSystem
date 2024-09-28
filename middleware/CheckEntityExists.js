const Doctor = require("../models/DoctorModel");
const Patient = require("../models/PatientModel");

const checkIfPatientExists = async (req, res, next) => {
  const { patientEmail } = req.body;
  const isPatient = patientEmail && patientEmail.length > 0;

  if (!isPatient) {
    return res.status(420).json({
      error: "Provide User email",
    });
  }

  try {
    const patient = Patient.findOne({
      email: { $eq: patientEmail },
    });

    if (!patient) {
      res.status(420).json({
        error: "Patient Does not Exist",
      });
    }
    next();
  } catch (error) {
    console.error("Error checking patient existence:", error);
    res.status(500).json({ error: "Failed to check patient existence." });
  }
};

const checkIfDoctorExists = async (req, res, next) => {
  const { doctorEmail } = req.body;

  if (!doctorEmail || doctorEmail.trim() === "") {
    return res.status(420).json({ error: "Doctor email is required." });
  }

  try {
    const doctor = await Doctor.findOne({ email: doctorEmail });
    if (!doctor) {
      return res.status(420).json({ error: "Doctor does not exist." });
    }
    next();
  } catch (error) {
    console.error("Error checking doctor existence:", error);
    res.status(500).json({ error: "Failed to check doctor existence." });
  }
};


module.exports = { checkIfDoctorExists, checkIfPatientExists }