const mongoose = require('mongoose')

/**
 * Report Schema
 * Represents a report submitted against an ad, user, or chat
 */
const reportSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // reference to reported product
    tag:    { type: String },                         // ad | user | chat
    title:  { type: String, required: true },         // report title
    desc:   { type: String },                         // report description
    type:   { type: String },                         // report type
    status: { type: String, default: 'pending' },     // pending | resolved | rejected
}, { timestamps: true })

module.exports = mongoose.model('Report', reportSchema)