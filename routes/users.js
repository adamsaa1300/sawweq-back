const router = require('express').Router()
const User = require('../models/User')

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               uni:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, uni, status } = req.body

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' })
        }

        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Invalid email format' })
        }

        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(400).json({ error: 'Email already exists' })
        }

        const user = new User({ name, email, uni, status })
        await user.save()
        res.status(201).json(user)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, banned]
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        const allowedStatus = ['active', 'suspended', 'banned']
        if (req.body.status && !allowedStatus.includes(req.body.status)) {
            return res.status(400).json({ error: 'Invalid status value' })
        }

        const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json(updated)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        await User.findByIdAndDelete(req.params.id)
        res.json({ message: 'User deleted successfully' })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = router