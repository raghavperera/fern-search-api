const express = require('express');
const app = express();

// Your AI processing routes (e.g., OpenAI, AssemblyAI transcription) here...

// CRITICAL: Bind to process.env.PORT and 0.0.0.0
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Note Taker service running on port ${PORT}`);
});
