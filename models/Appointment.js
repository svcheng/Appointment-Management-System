const mongoose = require('mongoose')

const AppointmentSchema = new mongoose.Schema({
    storeID: Number,
    bookerName: String,
    bookerPhoneNum: Number,
    startTime: String,
    endTime: String,
    service: String
});

const Appointment = mongoose.model('Appointment', AppointmentSchema)
module.exports = Appointment