const mongoose = require('mongoose')

/**
 * Ad Schema
 * Represents a marketplace listing posted by a student
 */
const adSchema = new mongoose.Schema({
    title:       { type: String, required: true },    // ad title
    user:        { type: String, required: true },    // name of the user who posted
    category:    { type: String },                    // category e.g. Books, Electronics
    price:       { type: Number },                    // price in NIS
    description: { type: String },                    // ad description
    images:      { type: [String], default: [] },     // array of image URLs
    location:    { type: String },                    // ad location
    status:      { type: String, default: 'active' }, // active | pending | rejected
}, { timestamps: true })

module.exports = mongoose.model('Ad', adSchema)