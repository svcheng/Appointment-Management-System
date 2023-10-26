const mongoose = require('mongoose')

const AppointmentSchema = new mongoose.Schema({
    storeName: {type: String, required: true},
    bookerName: {type: String, required: true},
    bookerPhoneNum: {type: String, required: true},

    startDatetime: {type: Date, required: true}, 
    endDatetime: {type: Date, required: true},
    service: {type: String, required: true}
});

const Appointment = mongoose.model('Appointment', AppointmentSchema)
module.exports = Appointment