const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth")
const admin = require("../middleware/admin")
const multer = require("multer")
const User = require("../models/User")
const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "sawweq_products",
        allowed_formats: ["jpg", "png", "jpeg", "webp"]
    }
})

const upload = multer({ storage })
// GET all//for home page &search page + filtering in the front
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


/**
 * @swagger
 * /api/products/user/{id}:
 *   get:
 *     summary: Get all products created by a specific user
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User products retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/user/:id", async (req, res) => {//for user profile

    try {

        const products = await Product.find({
            user: req.params.id
        });

        res.json(products);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

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
router.post("/", auth, upload.array("images", 8), async (req, res) => {
    try {
        const imagePaths = req.files ? req.files.map(file => file.path) : [];
        const user = await User.findById(req.user.id)
        const product = new Product({
            ...req.body,
            user: req.user.id,
            userName: user.name,
            images: imagePaths,
            status: "available"
        });
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
});


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
        const existingProduct =
            await Product.findById(req.params.id)

        if (!existingProduct) {

            return res.status(404).json({
                error: "Product not found"
            });

        }

        if (
            existingProduct.user.toString()
            !== req.user.id &&
            req.user.role !== "admin"
        ) {

            return res.status(403).json({
                error: "Unauthorized"
            });

        }
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
        const existingProduct =
            await Product.findById(req.params.id)

        if (!existingProduct) {

            return res.status(404).json({
                error: "Product not found"
            });

        }

        if (
            existingProduct.user.toString()
            !== req.user.id &&
            req.user.role !== "admin"
        ) {

            return res.status(403).json({
                error: "Unauthorized"
            });

        }
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All products deleted
 *       403:
 *         description: Admin only
 */
router.delete("/", auth,admin,async (req, res) => {//delete all
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


router.get("/count/:id", async (req, res) => {

    try {

        const count = await Product.countDocuments({
            user: req.params.id
        });

        res.json({ count });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});
module.exports = router;