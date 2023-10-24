const mongoose = require('mongoose')

const StoreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    services: { // the names of the services
        type: [String],
        default: [] 
    },
    serviceDurations: { // the time in minutes a service takes
        type: [Number],
        default: [] 
    }
});

const Store = mongoose.model('Store', StoreSchema)
module.exports = Store