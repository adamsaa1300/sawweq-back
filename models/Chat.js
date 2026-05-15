const mongoose = require('mongoose')

/**
 * Message Schema
 * Represents a single message inside a chat
 */
const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },   // name of the sender
    text:   { type: String, required: true },   // message content
    time:   { type: Date, default: Date.now },  // time of the message
})

/**
 * Chat Schema
 * Represents a conversation between two users about an ad
 */
const chatSchema = new mongoose.Schema({
    user1:    { type: String, required: true },     // first user
    user2:    { type: String, required: true },     // second user
    subject:  { type: String },                     // subject of the chat (ad title)
    status:   { type: String, default: 'active' },  // active | flagged | closed
    messages: [messageSchema],                      // array of messages
}, { timestamps: true })

module.exports = mongoose.model('Chat', chatSchema)