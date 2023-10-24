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
    services: {
        type: Array,
        default: [] // a service should be {serviceName, length} where length is the number of hours a <serviceName> appointment takes up
    }
});

const Store = mongoose.model('Store', StoreSchema)
module.exports = Store