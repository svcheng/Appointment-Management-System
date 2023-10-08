const mongoose = require('mongoose')

const StoreSchema = new mongoose.Schema({
    storeID: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true,
    }
});

const Store = mongoose.model('Store', StoreSchema)
module.exports = Store