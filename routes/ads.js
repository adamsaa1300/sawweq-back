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


router.get('/', async (req, res) => {
    try {
        const ads = await Ad.find()
        res.json(ads)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

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
        res.status(500).json({ error: err.message })
    }
})

router.post('/', upload.array("images", 8), async (req, res) => {
    try {
        const imagePaths = req.files.map(
            file => `http://localhost:5000/uploads/${file.filename}`
        )

        const ad = new Ad({
            ...req.body,
            images: imagePaths
        })

        await ad.save()

        res.status(201).json(ad)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true})
        res.json(ad)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        await Ad.findByIdAndDelete(req.params.id)
        res.json({ message: 'deleted' })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})



module.exports = router