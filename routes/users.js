const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require("bcryptjs")//to have encrypted hash passwords
const jwt = require("jsonwebtoken")

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
        const users = await User.find().select('-password')//to not show passwords
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

        const token = jwt.sign(

            {
                id: user._id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        )

        res.status(201).json({

            message: "User created successfully",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                faculty: user.faculty,
                uni: user.uni,
                role: user.role
            }

        })

    } catch (err) {
        res.status(500).json({
            error: err.message
        })
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
        res.status(500).json({
            error: err.message
        })
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
        res.status(400).json({
            error: err.message
        })
    }

})




/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:id', async (req, res) => {

    try {

        await User.findByIdAndDelete(req.params.id)

        res.json({ message: 'deleted' })

    } catch (err) {

        res.status(400).json({
            error: err.message
        })

    }

})
router.put("/reset-password", async (req, res) => {

    try {

        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;

        await user.save();

        res.json({
            message: "Password updated successfully"
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});
module.exports = router