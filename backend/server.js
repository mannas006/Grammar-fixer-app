const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the 'frontend' folder
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/api/fix-grammar', async (req, res) => {
    const { GPTAPI } = await import('gpt-api');
    const gpt = new GPTAPI('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'); // Replace 'your_api_key' with your actual GPT API key
    const textToFix = req.body.text;
    const fixedText = await gpt.grammarFix(textToFix);
    res.json({ fixedText });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
