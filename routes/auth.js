const router = require('express').Router()
const Admin = require('../models/Admin')
const jwt = require('jsonwebtoken')

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns token
 *       400:
 *         description: Invalid email or password
 */

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email format' })
        }

        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(400).json({ error: 'Invalid email or password' })
        }

        if (password !== admin.password) {
            return res.status(400).json({ error: 'Invalid email or password' })
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            token,
            admin: { name: admin.name, email: admin.email, role: admin.role }
        })

    } catch (err) {
        res.status(500).json({ error: 'Login failed' })
    }
})

module.exports = router