const router = require('express').Router()
const User = require('../models/User')

router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post('/', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        res.status(201).json(user)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true})
        res.json(user)
    } catch (err) {
        res.status(400).json({ error: err.message })
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