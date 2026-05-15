const mongoose = require('mongoose')

/**
 * Ad Schema
 * Represents a marketplace listing posted by a student
 */
const adSchema = new mongoose.Schema({
    title:       { type: String, required: true },  // ad title
    user:        { type: String, required: true },  // name of the user who posted
    category:    { type: String },                  // category e.g. Books, Electronics
    price:       { type: String },                  // price in NIS
    description: { type: String },                  // ad description
    image:       { type: String },                  // image URL
    status:      { type: String, default: 'active' }, // active | pending | rejected
}, { timestamps: true })

module.exports = mongoose.model('Ad', adSchema)