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
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/', async (req, res) => {//get all users
    try {
        const users = await User.find().select('-password')//to not show passwords
        res.json(users)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Register new user
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
 */
router.post('/', async (req, res) => {//create a user
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

        const user = new User({
            name,
            birthDate,
            location,
            faculty,
            uni,
            email,
            password: hashedPassword,
            role
        })

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
router.post('/login', async (req, res) => {//email and passwor validation & JWT token generaion & role detection
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
                expiresIn: "7d"
            }

        )

        res.json({

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
 *   get:
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
router.get('/:id', async (req, res) => {//get by id
    try {
        const user = await User.findById(req.params.id).select('-password')

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
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put('/:id', async (req, res) => {//update user

    try {

        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10)
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select('-password')

        res.json(user)

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