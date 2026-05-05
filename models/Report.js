const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
    tag:    { type: String },
    title:  { type: String, required: true },
    desc:   { type: String },
    type:   { type: String },
    status: { type: String, default: 'pending' },
}, { timestamps: true })

module.exports = mongoose.model('Report', reportSchema)