const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // The user who sent the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Message text
    text: {
      type: String,
      required: true,
      trim: true,
    },

    // Check if message is read
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const productChatSchema = new mongoose.Schema(
  {
    // The customer who asks about the product
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The product owner
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The product this chat is about
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Chat messages
    messages: [messageSchema],

    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

// Prevent duplicate chat for same buyer, seller, and product
productChatSchema.index(
  { buyer: 1, seller: 1, product: 1 },
  { unique: true }
);

module.exports = mongoose.model("ProductChat", productChatSchema);