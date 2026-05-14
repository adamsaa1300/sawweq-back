const router = require('express').Router()
const Report = require('../models/Report')

router.get('/', async (req, res) => {
    try {
        const reports = await Report.find()
        res.json(reports)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})
/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new report
 *     tags: [Reports]
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             properties:
 *
 *               productId:
 *                 type: string
 *
 *               type:
 *                 type: string
 *
 *               reason:
 *                 type: string
 *
 *     responses:
 *       201:
 *         description: Report created successfully
 *
 *       400:
 *         description: Validation error
 */
router.post('/', async (req, res) => {
    try {
        const report = new Report(req.body)

        await report.save()

        console.log("REPORT SAVED")

        res.status(201).json(report)

    } catch (err) {

    res.status(400).json({
        error: err.message
    })
    }

})

router.put('/:id', async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(req.params.id, req.body, {new: true})
        res.json(report)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

router.delete('/:id', async (req, res) => {
    try {
        await Report.findByIdAndDelete(req.params.id)
        res.json({ message: 'deleted' })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

module.exports = router