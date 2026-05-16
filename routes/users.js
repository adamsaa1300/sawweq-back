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
router.get('/', async (req, res) => {//get all users
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
router.post('/', async (req, res) => {//create a user //used in register
//Duplicate email prevention &Password hashing
    // & JWT generation & Automatic login after registration
    try {
        const {
            name, birthDate, location, faculty, uni, email, password, role
        } = req.body
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                error: "Email already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
//hashing password so passwords become encrypted duplicate emails prevented cleaner register logic safer backend
        const user = new User({name, birthDate, location, faculty, uni, email, password: hashedPassword, role})
        await user.save()
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "5h"
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
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
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
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {//used in log in page //email and passwor validation & JWT token generaion & role detection
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                field: "email",
                error: "Email not found"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)//Checks if entered password matches stored encrypted password.
        if (!isMatch) {
            return res.status(400).json({
                field: "password",
                error: "Wrong password"
            })
        }
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "5h"
            }
        )
        res.status(201).json({
            message: "Login successful",
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
 *     summary: Get user by ID
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
 *         description: User found
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


module.exports = router