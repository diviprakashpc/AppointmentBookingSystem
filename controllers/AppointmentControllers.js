const Appointment = require("../models/AppointmentModel");
const Doctor = require("../models/DoctorModel");
const Patient = require("../models/PatientModel");
const { CANCELLED, timeToMinutes, ValidateBody, BOOKED } = require("../utils/helper");

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
      doctor : doctor._id
    });
    if (existingAppointment) {
      return response
        .status(420)
        .json({ error: "Patient already has an appointment booked with this doctor." });
    }

    const formattedStartTime = timeToMinutes(startTime)
    const formattedEndTime = timeToMinutes(endTime)

    if(formattedEndTime <= formattedStartTime) {
      return response.status(420).json({
       error :  "End time cannot be greater than start time"
      })
    }

    if(formattedEndTime == 0){
      return response.status(420).json({
        "error" : "Invalid Request"
      })
    }

    const overlappingAppointment = await Appointment.findOne({
      doctor: doctor._id,
      $or: [
        { 'timeStamp.startTime': { $lt: formattedEndTime, $gte: formattedStartTime } }, 
        { 'timeStamp.endTime': { $gt: formattedStartTime, $lte: formattedEndTime } },
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
      patientEmail : patient.email,
      doctorEmail : doctor.email
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

const CancelAppointmentController = async (request, response ) => {
  try {
    const {
      patient: patientEmail,
      doctor : doctorEmail,
      timeSlot: { startTime, endTime },
    } = request.body;

    if(!ValidateBody([patientEmail, startTime, endTime])) {
      return response.status(401).json({
        "Error" : "Invalid Request"
      })
    }

    const patient = await Patient.findOne({ email: patientEmail });
    if (!patient) {
      return response.status(460).json({ error: "Patient not found." });
    }

    const doctor = await Doctor.findOne({email : doctorEmail})

    if (!doctor) {
      return response.status(460).json({ error: "Doctor not found." });
    }

    const formattedStartTime = timeToMinutes(startTime)
    const formattedEndTime = timeToMinutes(endTime)
    console.log(startTime  + "   " +  endTime + "  " + formattedStartTime, + "         "+ formattedEndTime)
    // We will find appointment
    const appointment = await Appointment.findOne({
      "patient": { $eq : patient._id},
      "timeStamp.startTime":  { $eq : formattedStartTime},
      "timeStamp.endTime": { $eq : formattedEndTime },
      "doctor" : { $eq : doctor._id },
      "status" : { $eq : BOOKED }
    });

    if (!appointment) {
      return response.status(460).json({ error: "This Appointment is not found. It is either already cancelled or not present." });
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

module.exports = { CancelAppointmentController, CreateAppointmentController };
