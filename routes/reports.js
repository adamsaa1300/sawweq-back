const router = require('express').Router()
const Report = require('../models/Report')

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reports
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find()
        res.json(reports)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reports' })
    }
})
/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create new report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               desc:
 *                 type: string
 *               tag:
 *                 type: string
 *                 enum: [ad, user, chat]
 *     responses:
 *       201:
 *         description: Report created
 *       400:
 *         description: Validation error
 */
router.post('/', async (req, res) => {//used in cards ptoducts
    try {
        const { title, desc, tag } = req.body

        if (!title || !tag) {
            return res.status(400).json({ error: 'Title and tag are required' })
        }

        const allowedTags = ['ad', 'user', 'chat']
        if (!allowedTags.includes(tag)) {
            return res.status(400).json({ error: 'Invalid tag value' })
        }

        const report = new Report({ title, desc, tag, status: 'pending' })
        await report.save()

        console.log("REPORT SAVED")

        res.status(201).json(report)

    } catch (err) {

    res.status(400).json({
        error: err.message
    })
    }

})

/**
 * @swagger
 * /api/reports/{id}:
 *   put:
 *     summary: Update report status
 *     tags: [Reports]
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
 *                 enum: [pending, resolved, rejected]
 *     responses:
 *       200:
 *         description: Report updated
 *       404:
 *         description: Report not found
 */
router.put('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
        if (!report) {
            return res.status(404).json({ error: 'Report not found' })
        }

        const allowedStatus = ['pending', 'resolved', 'rejected']
        if (req.body.status && !allowedStatus.includes(req.body.status)) {
            return res.status(400).json({ error: 'Invalid status value' })
        }

        const updated = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.json(updated)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Delete report
 *     tags: [Reports]
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
 *         description: Report deleted
 *       404:
 *         description: Report not found
 */
router.delete('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
        if (!report) {
            return res.status(404).json({ error: 'Report not found' })
        }

        await Report.findByIdAndDelete(req.params.id)
        res.json({ message: 'Report deleted successfully' })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = router