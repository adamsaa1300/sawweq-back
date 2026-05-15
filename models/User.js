const mongoose = require('mongoose')

/**
 * User Schema
 * Represents a student user on the Sawweq marketplace
 */
const userSchema = new mongoose.Schema({
    name:   { type: String, required: true },           // full name
    email:  { type: String, required: true, unique: true }, // unique email
    uni:    { type: String },                           // university name
    status: { type: String, default: 'active' },        // active | suspended | banned
    role:   { type: String, default: 'user' },          // user role
    ads:    { type: Number, default: 0 },               // number of ads posted
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)