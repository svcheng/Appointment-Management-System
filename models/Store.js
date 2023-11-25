const mongoose = require('mongoose')
const bcrypt = require('bcrypt')



const StoreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
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
    },
    workingHoursStart: {
        type: Number,
        default: -1
    },
    workingHoursEnd: {
        type: Number,
        default: -1
    }
});

//password hashing
StoreSchema.pre('save', async function (next) {
    // Occurs only if password was modified
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const Store = mongoose.model('Store', StoreSchema)
module.exports = Store
