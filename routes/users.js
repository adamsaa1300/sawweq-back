const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require("bcryptjs")
router.get('/', async (req, res) => {//get all users
    try {
        const users = await User.find().select('-password')//to not show passwords
        res.json(users)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})
router.post('/', async (req, res) => {//create a user

    try {
        const {name, birthDate, location, uni, email,password} = req.body

        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(400).json({
                error: "Email already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
//hashing password so passwords become encrypted duplicate emails prevented cleaner register logic safer backend
        const user = new User({name, birthDate, location, uni, email, password: hashedPassword})

        await user.save()

        res.status(201).json({
            message: "User created successfully"
        })

    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
})

router.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                error: "Invalid email or password"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                error: "Invalid email or password"
            })
        }

        res.json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
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

router.delete('/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.json({ message: 'deleted' })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = router