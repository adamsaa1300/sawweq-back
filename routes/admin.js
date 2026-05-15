const router = require('express').Router()
const Admin = require('../models/Admin')

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Get admin info
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin info
 *       404:
 *         description: Admin not found
 */
router.get('/', async (req, res) => {
    try {
        const admin = await Admin.findOne()
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' })
        }
        res.json(admin)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admin' })
    }
})

/**
 * @swagger
 * /api/admin/{id}:
 *   put:
 *     summary: Update admin info
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin updated
 *       404:
 *         description: Admin not found
 */
router.put('/:id', async (req, res) => {
    try {
        const { name, email } = req.body

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' })
        }

        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email format' })
        }

        const admin = await Admin.findById(req.params.id)
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        const updated = await Admin.findByIdAndUpdate(req.params.id, { name, email }, { new: true })
        res.json(updated)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

/**
 * @swagger
 * /api/admin/password/{id}:
 *   put:
 *     summary: Change admin password
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Wrong current password
 *       404:
 *         description: Admin not found
 */
router.put('/password/:id', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' })
        }

        if (newPassword.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters' })
        }

        const admin = await Admin.findById(req.params.id)
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        if (admin.password !== currentPassword) {
            return res.status(400).json({ error: 'Wrong current password' })
        }

        admin.password = newPassword
        await admin.save()
        res.json({ message: 'Password updated successfully' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router