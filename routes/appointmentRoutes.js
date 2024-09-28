const express = require("express");
const { CancelAppointmentController, CreateAppointmentController } = require("../controllers/AppointmentControllers");
const router = express.Router();


router.route("/create").post(CreateAppointmentController)

router.route("/cancel").post(CancelAppointmentController)



module.exports = router