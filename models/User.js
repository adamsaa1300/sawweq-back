const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:   { type: String, required: true },
    email:  { type: String, required: true, unique: true },
    uni:    { type: String },
    status: { type: String, default: 'active' },
    role:   { type: String, default: 'user' },
    ads:    { type: Number, default: 0 },
}, {timestamps: true})

module.exports = mongoose.model('User', userSchema)