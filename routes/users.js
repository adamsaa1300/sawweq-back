const router = require('express').Router()

const Product = require("../models/Product");
const Report = require("../models/Report");
const Chat = require("../models/Chat");
const User = require('../models/User')

const bcrypt = require("bcryptjs")//to have encrypted hash passwords
const jwt = require("jsonwebtoken")

const auth = require("../middleware/auth")
const admin = require("../middleware/admin")

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
 *       403:
 *         description: Admin only
 */
router.get('/', auth, admin, async (req, res) => {//get all users

    try {

        const users = await User.find()
            .select('-password')//to not show passwords

        res.json(users)

    } catch (err) {

        res.status(500).json({
            error: 'Failed to fetch users'
        })

    }

})

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               birthDate:
 *                 type: string
 *               location:
 *                 type: string
 *               faculty:
 *                 type: string
 *               uni:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', async (req, res) => {//create a user //used in register

//Duplicate email prevention &Password hashing
// & JWT generation & Automatic login after registration

    try {

        const {
            name,
            birthDate,
            location,
            faculty,
            uni,
            email,
            password
        } = req.body
        const cleanEmail =
            email.trim();
        const existingUser = await User.findOne({
            email: cleanEmail
        })

        if (existingUser) {

            return res.status(400).json({
                error: "Email already exists"
            })

        }

        const hashedPassword =
            await bcrypt.hash(password, 10)

//hashing password so passwords become encrypted duplicate emails prevented cleaner register logic safer backend

        const user = new User({

            name,
            birthDate,
            location,
            faculty,
            uni,
            email: cleanEmail,
            password: hashedPassword,
            role: "user"

        })

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
                birthDate: user.birthDate,
                location: user.location,
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

        const email =
            req.body.email.trim();

        const password =
            req.body.password;

        const user = await User.findOne({
            email
        })

        if (!user) {

            return res.status(400).json({
                field: "email",
                error: "Email not found"
            })

        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        )//Checks if entered password matches stored encrypted password.

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

        res.status(200).json({

            message: "Login successful",

            token,

            user: {

                id: user._id,
                name: user.name,
                email: user.email,
                birthDate: user.birthDate,
                location: user.location,
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
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {

    try {

        const user = await User.findById(req.params.id)
            .select("-password")

        if (!user) {

            return res.status(404).json({
                error: "User not found"
            })

        }

        res.json(user)

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
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put("/:id", auth, async (req, res) => {

    try {

        if (

            req.user.id !== req.params.id &&
            req.user.role !== "admin"

        ) {

            return res.status(403).json({
                error: "Unauthorized"
            })

        }

        const updatedUser = await User.findByIdAndUpdate(

            req.params.id,

            {
                name: req.body.name,
                email: req.body.email,
                location: req.body.location,
                faculty: req.body.faculty,
                uni: req.body.uni,
                bio: req.body.bio,
            },

            { new: true }

        )

        if (!updatedUser) {

            return res.status(404).json({
                error: "User not found"
            })

        }

        res.json(updatedUser)

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
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Admin only
 *       404:
 *         description: User not found
 */
router.delete("/:id", auth, admin, async (req, res) => {

    try {

        const userId = req.params.id

        const userProducts = await Product.find({
            user: userId
        })

        const productIds = userProducts.map(
            product => product._id
        )

        await Product.deleteMany({
            user: userId
        })

        await Report.deleteMany({

            $or: [

                { user: userId },

                {
                    productId: {
                        $in: productIds
                    }
                }

            ]

        })

        await Chat.deleteMany({
            participants: userId
        })

        await User.findByIdAndDelete(userId)

        res.json({
            message:
                "User and all related data deleted"
        })

    } catch (err) {

        res.status(500).json({
            error: err.message
        })

    }

})

/**
 * @swagger
 * /api/users/google-login:
 *   post:
 *     summary: Login/Register with Google
 *     tags: [Users]
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
 *         description: Google login successful
 *       500:
 *         description: Server error
 */
router.post('/google-login', async (req, res) => {

    try {

        const { name, email } = req.body

        let user = await User.findOne({
            email
        })

        if (!user) {

            const hashedPassword =
                await bcrypt.hash(
                    "google-login",
                    10
                )

            user = new User({

                name,
                email,
                password: hashedPassword,
                role: "user"

            })

            await user.save()

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
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
})

module.exports = router