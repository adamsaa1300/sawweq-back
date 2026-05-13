const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth")
const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

// GET all
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all products
 */
router.get("/", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// SEARCH products
/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Matching products
 */
router.get("/search", async (req, res) => {
    const { q } = req.query;
    const products = await Product.find({
        title: { $regex: q, $options: "i" }//regex makes search flexible and not case-sensitive
    });
    res.json(products);
});


/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
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


/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post("/", auth, upload.array("images", 8), async (req, res) => {//create product
    try {
        const imagePaths = req.files.map(
            file => `http://localhost:5000/uploads/${file.filename}`
        )

        const product = new Product({
            ...req.body,
            user: req.user.id,
            userName: req.body.userName,
            images: imagePaths
        })

        await product.save()

        res.status(201).json(product)
    } catch (err) {
        res.status(400).json({
            error: err.message
        })
    }
})


/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
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


/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
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


/**
 * @swagger
 * /api/products:
 *   delete:
 *     summary: Delete all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: All products deleted
 */
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