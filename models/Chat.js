const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    text:   { type: String, required: true },
    time:   { type: Date,   default: Date.now},
})

const chatSchema = new mongoose.Schema({
    user1:      { type: String, required: true},
    user2:      { type: String, required: true},
    subject:    { type: String },
    status:     { type: String, default: 'active' },
    messages: [messageSchema],
}, { timestamps: true })

module.exports = mongoose.model('Chat', chatSchema)