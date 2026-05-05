const mongoose = require('mongoose')

const adSchema = new mongoose.Schema({
    title:      { type: String, required: true },
    user:       { type: String, required: true },
    category:   { type: String },
    price:   { type: String },
    description:   { type: String },
    image:   { type: String },
    status:  { type: String, default: 'active' },
}, { timestamps: true })

module.exports = mongoose.model('Ad', adSchema)