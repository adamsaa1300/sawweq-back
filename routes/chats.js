const router = require('express').Router()
const Chat = require('../models/Chat')

router.get('/', async (req, res) => {
    try {
        const chats = await Chat.find()
        res.json(chats)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id)
        res.json(chat)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

router.post('/', async (req, res) => {
    try {
        const chat = new Chat(req.body)
        await chat.save()
        res.status(201).json(chat)
    } catch (err) {
        res.status(400).json({ error:err.message })
    }
})

module.exports = router