const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    name: {type: String,required: true},
    birthDate: {type: Date , required: true},
    location: {type: String,required: true},
    uni: {type: String,required: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},//no duplicate emails automatically lowercase removes extra spaces
    password: {type: String, required: true},
    status: {type: String, default: 'active'},
    role: {type: String, default: 'user'},
    ads: {type: Number, default: 0}
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)