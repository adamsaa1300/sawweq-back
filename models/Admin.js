const mongoose = require('mongoose')

/**
 * Admin Schema
 * Represents an admin user who manages the Sawweq dashboard
 */
const adminSchema = new mongoose.Schema({
    name:     { type: String, required: true },          // admin full name
    email:    { type: String, required: true, unique: true }, // unique email
    password: { type: String, required: true },          // plain text password
    role:     { type: String, default: 'admin' },        // admin role
}, { timestamps: true })

module.exports = mongoose.model('Admin', adminSchema)