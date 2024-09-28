const mongoose = require("mongoose")

const timeStampSchema = mongoose.Schema({
    startTime : {
        type : Number,
        required : true
    },
    endTime : {
        type : Number,
        required : true
    }
})

const appointmentSchema = mongoose.Schema({
    patient : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'Patient',
    },
    doctor : {
        type : mongoose.Schema.ObjectId,
        required : true,
        ref : 'Doctor' // Doctor can have multiple appointments
    },
    timeStamp : {
        type : timeStampSchema,
        required : true
    },
    status : {
        type : String,
        required : false
    },
    patientEmail : String,
    doctorEmail : String
})

const Appointment = mongoose.model('Appointment', appointmentSchema) // Appointment Model

module.exports = Appointment

