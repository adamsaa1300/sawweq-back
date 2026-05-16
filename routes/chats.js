const router = require('express').Router()
const Chat = require('../models/Chat')

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get all chats
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all chats
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
    try {
        const chats = await Chat.find()
        res.json(chats)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chats' })
    }
})

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Get single chat by id
 *     tags: [Chats]
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
 *         description: Chat details with messages
 *       404:
 *         description: Chat not found
 */
router.get('/:id', async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id)

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' })
        }

        res.json(chat)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chat' })
    }
})

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Create new chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user1:
 *                 type: string
 *               user2:
 *                 type: string
 *               subject:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat created
 *       400:
 *         description: Validation error
 */
router.post('/', async (req, res) => {
    try {
        const { user1, user2 } = req.body

        if (!user1 || !user2) {
            return res.status(400).json({ error: 'user1 and user2 are required' })
        }

        const chat = new Chat(req.body)
        await chat.save()
        res.status(201).json(chat)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = router