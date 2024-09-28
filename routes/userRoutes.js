const express = require("express");
const { AddDoctorController, AddPatientController } = require("../controllers/UserControllers");
const router = express.Router();


router.route("/create/patient").post(AddPatientController)

router.route("/create/doctor").post(AddDoctorController)



module.exports =  router 