const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad'); 
const multer = require('multer');
const path = require('path');

/**
 * @swagger
 * /api/create-ads:
 * post:
 * summary: Create a new advertisement
 * tags: [Ads]
 * requestBody:
 * required: true
 * content:
 * multipart/form-data:
 * schema:
 * type: object
 * properties:
 * title:
 * type: string
 * price:
 * type: number
 * location:
 * type: string
 * category:
 * type: string
 * images:
 * type: array
 * items:
 * type: string
 * format: binary
 * responses:
 * 201:
 * description: Ad created successfully
 * 500:
 * description: Server error
 */

// Multer storage configuration
const storage = multer.diskStorage({
    destination: 'uploads/', 
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST route to create a new ad
router.post('/', upload.array('images', 8), async (req, res) => {
    try {
        const adData = {
            ...req.body,
            images: req.files ? req.files.map(file => file.path) : []
        };
        
        const newAd = new Ad(adData);
        await newAd.save();
        res.status(201).json(newAd);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;