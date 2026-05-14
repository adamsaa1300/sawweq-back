const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
    productId: {type: mongoose.Schema.Types.ObjectId, ref: "Product"},
    type: {type: String, required: true},
    reason: {type: String},
    status: {type: String, default: 'pending'}
}, { timestamps: true })

module.exports = mongoose.model('Report', reportSchema)