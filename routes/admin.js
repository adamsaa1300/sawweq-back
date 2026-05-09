const router = require('express').Router()
const Admin = require('../models/Admin')

router.get('/', async (req, res) => {
    try {
        const admin = await Admin.findOne()
        res.json(admin)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true})
        res.json(admin)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.put('/password/:id', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const admin = await Admin.findById(req.params.id)

        if (admin.password !== currentPassword) {
            return res.status(400).json({ error: 'Wrong current password' })
        }

        admin.password = newPassword
        await admin.save()
        res.json({ message: 'Password updated' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router