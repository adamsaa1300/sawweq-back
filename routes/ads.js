const router = require('express').Router()
const Ad = require('../models/Ad')
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


/**
 * @swagger
 * /api/ads:
 *   get:
 *     summary: Get all ads
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all ads
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
    try {
        const ads = await Ad.find()
        res.json(ads)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch ads' })
    }
})

/**
 * @swagger
 * /api/ads/weekly:
 *   get:
 *     summary: Get weekly ads stats
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly stats for the last 7 days
 *       401:
 *         description: Unauthorized
 */
router.get('/weekly', async (req, res) => {
    try {
        const days = ['Sun', 'Sat', 'Fri', 'Thu', 'Wed', 'Tue', 'Mon']
        const colors = ['#993C1D', '#534AB7', '#185FA5', '#0F6E56', '#854F0B', '#185FA5', '#534AB7']

        const result = await Promise.all(
            days.map(async (day, i) => {
                const date = new Date()
                date.setDate(date.getDate() - i)
                const start = new Date(date.setHours(0, 0, 0, 0))
                const end = new Date(date.setHours(23, 59, 59, 999))
                const count = await Ad.countDocuments({ createdAt: { $gte: start, $lte: end } })
                return { day, val: count, color: colors[i] }
            })
        )
        res.json(result)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch weekly stats' })
    }
})

/**
 * @swagger
 * /api/ads:
 *   post:
 *     summary: Create new ad
 *     tags: [Ads]
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
 *               user:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, pending, rejected]
 *     responses:
 *       201:
 *         description: Ad created
 *       400:
 *         description: Validation error
 */
router.post('/', async (req, res) => {
    try {
        const { title, user, category, price } = req.body

        if (!title || !user) {
            return res.status(400).json({ error: 'Title and user are required' })
        }

        const allowedStatus = ['active', 'pending', 'rejected']
        if (req.body.status && !allowedStatus.includes(req.body.status)) {
            return res.status(400).json({ error: 'Invalid status value' })
        }

        const ad = new Ad({ title, user, category, price, status: req.body.status || 'active' })
        await ad.save()

        res.status(201).json(ad)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

/**
 * @swagger
 * /api/ads/{id}:
 *   put:
 *     summary: Update ad
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ad updated
 *       404:
 *         description: Ad not found
 */
router.put('/:id', async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id)
        if (!ad) {
            return res.status(404).json({ error: 'Ad not found' })
        }

        const updated = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json(updated)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

/**
 * @swagger
 * /api/ads/{id}:
 *   delete:
 *     summary: Delete ad
 *     tags: [Ads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ad deleted
 *       404:
 *         description: Ad not found
 */
router.delete('/:id', async (req, res) => {
    try {
        const ad = await Ad.findById(req.params.id)
        if (!ad) {
            return res.status(404).json({ error: 'Ad not found' })
        }

        await Ad.findByIdAndDelete(req.params.id)
        res.json({ message: 'Ad deleted successfully' })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = router