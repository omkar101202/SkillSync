const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: "USE_YOUR_API_KEY" }); // Replace with your OpenAI API key

router.post('/generate-technical-skills', async (req, res) => {
    try {
        const { jobDescription } = req.body;
        const prompt = `
            Generate a concise JSON format output of individual technical keywords most relevant to the specified job role specifically as identified by an Applicant Tracking System (ATS), derived directly from the provided job description. Keywords extracted in one to Two atomic words strictly in JSON syntax with consistent output.
            ${jobDescription}
            Output: JSON of [Skills1, skills 2,...]
        `;
        
        const response = await openai.completions.create({
            engine: "text-davinci-003",
            prompt,
            max_tokens: 150,
            temperature: 0.7,
            top_p: 1.0,
            n: 1,
            stop: ["Output:"]
        });

        const { choices } = response.data;
        const outputText = choices[0]?.text.trim();
        res.json({ technicalSkills: outputText });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
