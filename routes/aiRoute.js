const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');

/**
 * @description Initialize Hugging Face Inference
 */
const hf = new HfInference(process.env.HF_TOKEN);

/**
 * @swagger
 * /api/ai/improve-description:
 *   post:
<<<<<<< HEAD
 *     summary: Elevate and Improve ad descriptions to Professional English
=======
 *     summary: Improve ad descriptions in Arabic or English based on user input
>>>>>>> da908da754c41f8d3f36fb792f6808bffed118d8
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *     responses:
 *       200:
<<<<<<< HEAD
 *         description: Successfully generated professional English ad
=======
 *         description: Successfully generated improved ad description
>>>>>>> da908da754c41f8d3f36fb792f6808bffed118d8
 */

router.post('/improve-description', async (req, res) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: "Description is required" });
        }

        const isArabic = /[\u0600-\u06FF]/.test(description);

        const languageInstruction = isArabic
            ? "The input is Arabic. Rewrite and improve it in Arabic ONLY. Do not translate it to English or any other language."
            : "The input is English. Rewrite and improve it in English ONLY. Do not translate it to Arabic, Chinese, or any other language.";

        const response = await hf.chatCompletion({
            model: "Qwen/Qwen2.5-7B-Instruct",
            messages: [
                {
                    role: "system",
                    content: `
You are a professional ad copywriter.

${languageInstruction}

Rules:
- Keep the SAME language as the user's input.
- Never use Chinese characters.
- Never mix languages.
- Improve the text to sound modern, premium, catchy, and social-media friendly.
- Target university students.
- Use 1 to 3 relevant emojis naturally.
- Maximum 200 words.
- Return ONLY the improved ad text.
`
                },
                {
                    role: "user",
                    content: description
                }
            ],
            max_tokens: 250,
            temperature: 0.6,
        });

        const cleanText = response.choices[0].message.content.trim();
        res.json({ improvedDescription: cleanText });

    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ error: "AI failed", details: error.message });
    }
});

module.exports = router;