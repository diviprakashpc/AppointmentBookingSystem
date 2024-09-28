const express = require("express");
const { CancelAppointmentController, CreateAppointmentController, ViewAllAppointmentsByDoctor, GetAllAppointmentsByUser, ModifyAppointmentDetails } = require("../controllers/AppointmentControllers");
const router = express.Router();


router.route("/create").post(CreateAppointmentController)

router.route("/cancel").post(CancelAppointmentController)

router.route("/viewAll/:doctorEmail").get(ViewAllAppointmentsByDoctor) // One way to pass params.

router.route("/getAll").get(GetAllAppointmentsByUser) // This way i pass query and url and take it.

router.route("/modify").post(ModifyAppointmentDetails)


// In each controller we are validating the existence of patient and doctor. We can create a middleware for that. 


module.exports = router