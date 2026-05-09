const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth")
// GET all products
router.get("/", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// SEARCH products
router.get("/search", async (req, res) => {
    const { q } = req.query;

    const products = await Product.find({
        title: { $regex: q, $options: "i" }//regex makes search flexible and not case-sensitive
    });

    res.json(products);
});
router.get("/:id", async (req, res) => {//get by id

    try {

        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            })
        }

        res.json(product)

    } catch (err) {

        res.status(500).json({
            error: err.message
        })

    }

})
router.post("/", auth, async (req, res) => {//create product

    try {

        const product = new Product({
            ...req.body,
            user: req.user.id
        })

        await product.save()

        res.status(201).json(product)

    } catch (err) {

        res.status(400).json({
            error: err.message
        })

    }

})
router.put("/:id", auth, async (req, res) => {//update

    try {

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )

        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            })
        }

        res.json(product)

    } catch (err) {

        res.status(400).json({
            error: err.message
        })

    }

})
router.delete("/:id", auth, async (req, res) => {//delete by id

    try {

        const product = await Product.findByIdAndDelete(req.params.id)

        if (!product) {
            return res.status(404).json({
                error: "Product not found"
            })
        }

        res.json({
            message: "Product deleted successfully"
        })

    } catch (err) {

        res.status(400).json({
            error: err.message
        })

    }

})
router.delete("/", async (req, res) => {//delete all

    try {

        await Product.deleteMany()

        res.json({
            message: "All products deleted"
        })

    } catch (err) {

        res.status(500).json({
            error: err.message
        })

    }

})
module.exports = router;