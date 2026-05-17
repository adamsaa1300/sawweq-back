const router = require("express").Router();

const ProductChat = require("../models/ProductChat");
const Product = require("../models/Product");

// Admin can see all product chats
router.get("/", async (req, res) => {
  try {
    const chats = await ProductChat.find()
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("product")
      .populate("messages.sender", "name email")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start or get chat for a product
router.post("/start", async (req, res) => {
  try {
    const { buyerId, productId } = req.body;

    // Check required data
    if (!buyerId || !productId) {
      return res.status(400).json({
        error: "buyerId and productId are required",
      });
    }

    // Find product to get seller
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    // Seller is the product owner
    const sellerId = product.user;

    if (!sellerId) {
      return res.status(400).json({
        error: "Product seller not found",
      });
    }

    // Buyer cannot chat with himself
    if (buyerId.toString() === sellerId.toString()) {
      return res.status(400).json({
        error: "You cannot start chat with yourself",
      });
    }

    // Check if chat already exists for this product
    let chat = await ProductChat.findOne({
      buyer: buyerId,
      seller: sellerId,
      product: productId,
    })
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("product");

    // Create chat if it does not exist
    if (!chat) {
      chat = await ProductChat.create({
        buyer: buyerId,
        seller: sellerId,
        product: productId,
        messages: [],
      });

      chat = await ProductChat.findById(chat._id)
        .populate("buyer", "name email")
        .populate("seller", "name email")
        .populate("product");
    }

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all product chats for one user
router.get("/user/:userId", async (req, res) => {
  try {
    const chats = await ProductChat.find({
      $or: [
        { buyer: req.params.userId },
        { seller: req.params.userId },
      ],
    })
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("product")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one product chat
router.get("/:id", async (req, res) => {
  try {
    const chat = await ProductChat.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("product")
      .populate("messages.sender", "name email");

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found",
      });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send message
router.post("/:id/messages", async (req, res) => {
  try {
    const { senderId, text } = req.body;

    // Check required data
    if (!senderId || !text) {
      return res.status(400).json({
        error: "senderId and text are required",
      });
    }

    const chat = await ProductChat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found",
      });
    }

    // Add message to chat
    chat.messages.push({
      sender: senderId,
      text,
    });

    await chat.save();

    res.status(201).json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;