const mongoose = require('mongoose')

const adSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    user:        { type: String, required: true },
    category:    { type: String },
    price:       { type: Number }, 
    description: { type: String },
    images: { 
        type: [String], 
        default: [] 
    },
    location:    { type: String }, 
    status:      { type: String, default: 'active' },
}, { timestamps: true })

module.exports = mongoose.model('Ad', adSchema)