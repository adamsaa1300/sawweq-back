const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET all products
router.get("/", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// SEARCH products
router.get("/search", async (req, res) => {
    const { q } = req.query;

    const products = await Product.find({
        title: { $regex: q, $options: "i" }
    });

    res.json(products);
});

module.exports = router;