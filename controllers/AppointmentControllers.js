const Appointment = require("../models/AppointmentModel");
const Doctor = require("../models/DoctorModel");
const Patient = require("../models/PatientModel");
const {
  CANCELLED,
  timeToMinutes,
  ValidateBody,
  BOOKED,
} = require("../utils/helper");

const CreateAppointmentController = async (request, response) => {
  try {
    const {
      patientEmail = "",
      doctorEmail = "",
      specialization: requestedSpecialization = "",
      timeSlot = {},
    } = request.body;

    const { startTime = "", endTime = "" } = timeSlot;

    if (
      !ValidateBody([
        patientEmail,
        doctorEmail,
        requestedSpecialization,
        startTime,
        endTime,
      ])
    ) {
      return response.status(421).json({
        msg: "Invalid data to create",
      });
    }

    const patient = await Patient.findOne({
      email: { $eq: patientEmail },
    });
    if (!patient) {
      return response.status(420).json({ error: "Patient not found." });
    }

    const doctor = await Doctor.findOne({
      email: { $eq: doctorEmail },
    });
    if (!doctor) {
      return response.status(420).json({ error: "Doctor not found." });
    }

    // if (doctor.specialization !== requestedSpecialization) {
    //   return response
    //     .status(420)
    //     .json({ error: "Doctor does not specialize in the requested area." });
    // }

    const existingAppointment = await Appointment.findOne({
      patient: patient._id,
      status: { $ne: CANCELLED },
      doctor: doctor._id,
    });
    if (existingAppointment) {
      return response.status(420).json({
        error: "Patient already has an appointment booked with this doctor.",
      });
    }

    const formattedStartTime = timeToMinutes(startTime);
    const formattedEndTime = timeToMinutes(endTime);

    if (formattedEndTime <= formattedStartTime) {
      return response.status(420).json({
        error: "End time cannot be greater than start time",
      });
    }

    if (formattedEndTime == 0) {
      return response.status(420).json({
        error: "Invalid Request",
      });
    }

    const overlappingAppointment = await Appointment.findOne({
      doctor: doctor._id,
      $or: [
        {
          "timeStamp.startTime": {
            $lt: formattedEndTime,
            $gte: formattedStartTime,
          },
        },
        {
          "timeStamp.endTime": {
            $gt: formattedStartTime,
            $lte: formattedEndTime,
          },
        },
      ],
    });

    if (overlappingAppointment) {
      return response
        .status(420)
        .json({ error: "Time slot is already booked." });
    }

    // 6. Create the appointment
    const newAppointment = new Appointment({
      patient: patient._id,
      doctor: doctor._id,
      specialization: requestedSpecialization,
      status: BOOKED,
      timeStamp: {
        startTime: formattedStartTime,
        endTime: formattedEndTime,
      },
      patientEmail: patient.email,
      doctorEmail: doctor.email,
    });

    const savedAppointment = await newAppointment.save();
    return response.status(201).json({
      message: "Appointment created successfully.",
      appointment: savedAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return response
      .status(500)
      .json({ error: "Failed to create appointment." });
  }
};

const CancelAppointmentController = async (request, response) => {
  try {
    const {
      patient: patientEmail,
      doctor: doctorEmail,
      timeSlot: { startTime, endTime },
    } = request.body;

    if (!ValidateBody([patientEmail, startTime, endTime])) {
      return response.status(401).json({
        Error: "Invalid Request",
      });
    }

    const patient = await Patient.findOne({ email: patientEmail });
    if (!patient) {
      return response.status(460).json({ error: "Patient not found." });
    }

    const doctor = await Doctor.findOne({ email: doctorEmail });

    if (!doctor) {
      return response.status(460).json({ error: "Doctor not found." });
    }

    const formattedStartTime = timeToMinutes(startTime);
    const formattedEndTime = timeToMinutes(endTime);
    // We will find appointment
    const appointment = await Appointment.findOne({
      patient: { $eq: patient._id },
      "timeStamp.startTime": { $eq: formattedStartTime },
      "timeStamp.endTime": { $eq: formattedEndTime },
      doctor: { $eq: doctor._id },
      status: { $eq: BOOKED },
    });

    if (!appointment) {
      return response.status(460).json({
        error:
          "This Appointment is not found. It is either already cancelled or not present.",
      });
    }

    appointment.status = CANCELLED;
    await appointment.save();

    return response
      .status(200)
      .json({ message: "Appointment canceled successfully." });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    return response
      .status(401)
      .json({ error: "Failed to cancel appointment." });
  }
};

const ViewAllAppointmentsByDoctor = async (req, res) => {
  const { doctorEmail } = req.params;
  const params = [];

  if (!ValidateBody(Object.values(req.params))) {
    return res.status(421).json({
      msg: "Invalid data to create",
    });
  }

  const doctor = await Doctor.findOne({
    email: { $eq: doctorEmail },
  });

  if (!doctor) {
    return res.status(420).json({ error: "Doctor not found." });
  }

  const appointments = await Appointment.find({
    doctor: { $eq: doctor._id },
  });
  // If I dont use await I get query returned that I can run to get the actual data.
  // I can run using appointments.exec()

  return res.status(200).json({
    code: "200",
    model: appointments,
    msg: "Success",
  });
};

const GetAllAppointmentsByUser = async (req, res) => {
  if (!ValidateBody(Object.values(req.query))) {
    return res.status(421).json({
      msg: "Invalid data to create",
    });
  }

  const { patientEmail } = req.query;
  const params = [];

  const patient = await Patient.findOne({
    email: { $eq: patientEmail },
  });

  if (!patient) {
    return res.status(420).json({ error: "Patient not found." });
  }

  const appointments = await Appointment.find({
    patient: { $eq: patient._id },
  });

  return res.status(200).json({
    code: "200",
    model: appointments,
    msg: "Success",
  });
};

const ModifyAppointmentDetails = async (req, res) => {
  try {
    const { patientEmail, doctorEmail, newTimeSlot } = req.body;
    console.log(req.body)
    if (
      !patientEmail ||
      !doctorEmail ||
      !newTimeSlot ||
      !newTimeSlot.startTime ||
      !newTimeSlot.endTime
    ) {
      return res.status(400).json({ error: "Incomplete request data." });
    }
    const patient = await Patient.findOne({ email: patientEmail });
    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }
    const doctor = await Doctor.findOne({ email: doctorEmail });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found." });
    }
    const appointment = await Appointment.findOne({
      patient: patient._id,
      doctor: doctor._id,
      status : { $ne : CANCELLED}
    });
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found or Appointment is cancelled" });
    }
    
    const formattedNewStartTime = timeToMinutes(newTimeSlot.startTime);
    const formattedNewEndTime = timeToMinutes(newTimeSlot.endTime);
    if (formattedNewEndTime <= formattedNewStartTime) {
      return res.status(420).json({
        error: "End time cannot be greater than start time",
      });
    }
    if (formattedNewEndTime == 0) {
      return res.status(420).json({
        error: "Invalid Request",
      });
    }
    const overlappingAppointment = await Appointment.findOne({
      _id: { $ne: appointment._id },
      //  We want to not check the appointment that's currently being modified (appointment._id)
      $or: [
        {
          "timeStamp.startTime": {
            $lt: formattedNewEndTime,
            $gte: formattedNewStartTime,
          },
        },
        {
          "timeStamp.endTime": {
            $gt: formattedNewStartTime,
            $lte: formattedNewEndTime,
          },
        },
      ],
    });
    if (overlappingAppointment) {
      return res.status(409).json({ error: "Time slot is already booked." });
    }
    appointment.timeStamp.startTime = formattedNewStartTime;
    appointment.timeStamp.endTime = formattedNewEndTime;
    const savedAppointment = await appointment.save();
    return res.status(200).json({
      message: "Appointment modified successfully.",
      appointment: savedAppointment,
    });
  } catch (error) {
    console.error("Error modifying appointment:", error);
    return res.status(500).json({ error: "Failed to modify appointment." });
  }
};

module.exports = {
  CancelAppointmentController,
  CreateAppointmentController,
  ViewAllAppointmentsByDoctor,
  GetAllAppointmentsByUser,
  ModifyAppointmentDetails,
};
