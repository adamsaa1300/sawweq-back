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
 * post:
 * summary: Elevate and Improve ad descriptions to Professional English
 * tags: [AI]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * description:
 * type: string
 * responses:
 * 200:
 * description: Successfully generated professional English ad
 */

router.post('/improve-description', async (req, res) => {
    try {
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: "Description is required" });
        }

        const response = await hf.chatCompletion({
            model: "Qwen/Qwen2.5-7B-Instruct", 
            messages: [
                { 
                    role: "system", 
                    content: `You are an expert English Copywriter. 
                             Your goal is to take the user's input (regardless of language) and transform it into a high-converting, professional, and attractive English advertisement. 
                             - Do NOT just translate; rewrite it to sound sophisticated.
                             - Use professional marketing vocabulary (e.g., "Premium", "Pristine", "Elevate", "Cutting-edge").
                             - Targeted at: University students.
                             - Add relevant emojis and bullet points.
                             - Output ONLY the improved English text.` 
                },
                { 
                    role: "user", 
                    content: `Enhance and rewrite this ad in professional English: ${description}` 
                }
            ],
            max_tokens: 700,
            temperature: 0.8, 
        });

        const cleanText = response.choices[0].message.content.trim();
        res.json({ improvedDescription: cleanText });

    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ error: "AI failed", details: error.message });
    }
});

module.exports = router;