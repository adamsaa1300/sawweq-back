const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    title: { type: String, required: true },

    description: { type: String, required: true },

    price: { type: Number, required: true },

    images: [{ type: String }],

    category: { type: String, required: true },

    location: { type: String, required: true },

    university: { type: String, required: true },

    college: { type: String, required: true },

    condition: { type: String, default: 'new' },

    isNegotiable: { type: Boolean, default: false },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);