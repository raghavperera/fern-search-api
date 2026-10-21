const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve the frontend interface
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Simple Web Proxy</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 50px; text-align: center; }
                input[type="text"] { width: 60%; padding: 10px; font-size: 16px; }
                button { padding: 10px 20px; font-size: 16px; cursor: pointer; }
            </style>
        </head>
        <body>
            <h1>Enter a URL to browse via Proxy</h1>
            <form action="/proxy" method="GET">
                <input type="text" name="url" placeholder="https://example.com" required>
                <button type="submit">Go</button>
            </form>
        </body>
        </html>
    `);
});

// Proxy endpoint
app.get('/proxy', async (req, res) => {
    let targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('URL parameter is missing.');
    }

    // Ensure the URL has a protocol
    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'http://' + targetUrl;
    }

    try {
        // Fetch the target webpage
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            responseType: 'text'
        });

        let html = response.data;

        // Basic URL rewriting for absolute links so they stay within the proxy
        const urlObj = new URL(targetUrl);
        const origin = urlObj.origin;

        // Rewrite links (href="/path" -> href="/proxy?url=https://origin.com")
        html = html.replace(/(href|src)="\/([^"\s>]+)"/g, `$1="/proxy?url=${origin}/$2"`);

        res.send(html);
    } catch (error) {
        res.status(500).send(`Error fetching the requested page: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
