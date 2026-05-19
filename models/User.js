const mongoose = require('mongoose')

/**
 * User Schema
 * Represents a student user on the Sawweq marketplace
 */
const userSchema = new mongoose.Schema({
    name:      { type: String, required: true },              // full name
    birthDate: { type: Date,default: null},                // date of birth
    location:  { type: String,default: ""},              // user location
    faculty:   { type: String,default: ""},              // faculty name
    uni:       { type: String ,default: ""},              // university name
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true }, // unique email
    password:  { type: String, required: true },              // hashed password
    status:    { type: String, default: 'active' },           // active | suspended | banned
    role:      { type: String, default: 'user' },             // user role
  profileImage: { type: String, default: "" },
    ads:       { type: Number, default: 0 },                  // number of ads posted
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)