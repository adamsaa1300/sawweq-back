const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const multer = require("multer");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "sawweq_products",
        allowed_formats: ["jpg", "png", "jpeg", "webp"]
    }
});

const upload = multer({ storage });

router.get("/", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

router.get("/user/:id", async (req, res) => {
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

router.get("/:id", async (req, res) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({
                error: "Product not found"
            });

        }

        res.json(product);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
});

router.post("/", auth, upload.array("images", 8), async (req, res) => {

    try {

        const imagePaths =
            req.files
                ? req.files.map(file => file.path)
                : [];

        const user =
            await User.findById(req.user.id);

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

router.put("/:id", auth, upload.array("images", 8), async (req, res) => {

    try {

        const existingProduct =
            await Product.findById(req.params.id);

        if (!existingProduct) {

            return res.status(404).json({
                error: "Product not found"
            });

        }

        if (
            existingProduct.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {

            return res.status(403).json({
                error: "Unauthorized"
            });

        }

        const updatedData = {

            ...req.body,
images: [

    ...(
        req.body.existingImages
            ? JSON.parse(req.body.existingImages)
            : []
    ),

    ...(
        existingProduct.images || []
    ),

    ...(
        req.files
            ? req.files.map((file) => file.path)
            : []
    ),

].filter((img, index, self) =>
    self.indexOf(img) === index
),
            
        };

        const product = await Product.findByIdAndUpdate(

            req.params.id,

            updatedData,

            { new: true }

        );

        if (!product) {

            return res.status(404).json({
                error: "Product not found"
            });

        }

        res.json(product);

    } catch (err) {

        res.status(400).json({
            error: err.message
        });

    }

});

router.delete("/:id", auth, async (req, res) => {

    try {

        const existingProduct =
            await Product.findById(req.params.id);

        if (!existingProduct) {

            return res.status(404).json({
                error: "Product not found"
            });

        }

        if (
            existingProduct.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {

            return res.status(403).json({
                error: "Unauthorized"
            });

        }

        const product =
            await Product.findByIdAndDelete(req.params.id);

        if (!product) {

            return res.status(404).json({
                error: "Product not found"
            });

        }

        res.json({
            message: "Product deleted successfully"
        });

    } catch (err) {

        res.status(400).json({
            error: err.message
        });

    }

});

router.delete("/", auth, admin, async (req, res) => {

    try {

        await Product.deleteMany();

        res.json({
            message: "All products deleted"
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

router.get("/count/:id", async (req, res) => {

    try {

        const count =
            await Product.countDocuments({
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