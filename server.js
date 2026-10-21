const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Main landing page interface
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Advanced Web Proxy</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 50px; text-align: center; background: #f4f4f9; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                input[type="text"] { width: 80%; padding: 12px; font-size: 16px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 15px; box-sizing: border-box; }
                button { padding: 12px 24px; font-size: 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; width: 80%; }
                button:hover { background: #0056b3; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Advanced Proxy</h1>
                <p>Browse websites through your custom Render service</p>
                <form action="/proxy" method="GET">
                    <input type="text" name="url" placeholder="https://example.com" required>
                    <br>
                    <button type="submit">Browse Privately</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Proxy Request Handler
app.get('/proxy', async (req, res) => {
    let targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('Missing URL parameter.');

    // Automatically append HTTPS protocol if missing
    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
    }

    try {
        const parsedUrl = new URL(targetUrl);
        const origin = parsedUrl.origin;

        // Fetch the target site using arraybuffer to natively preserve images, fonts, and assets
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            responseType: 'arraybuffer', 
            validateStatus: () => true // Forward error statuses cleanly instead of crashing the proxy
        });

        // Set the content type header so the browser knows if it's reading an image, css, or html
        const contentType = response.headers['content-type'] || 'text/html';
        res.setHeader('Content-Type', contentType);

        // If it is a text/code file, rewrite the internal links to keep browsing inside the proxy
        if (contentType.includes('text') || contentType.includes('javascript') || contentType.includes('json')) {
            let dataText = response.data.toString('utf-8');

            // 1. Rewrite root relative paths (e.g., href="/style.css" -> href="/proxy?url=https://site.com")
            dataText = dataText.replace(/(href|src|action)="\/([^"\s>]+)"/g, `$1="/proxy?url=${origin}/$2"`);

            // 2. Rewrite explicit absolute links pointing back to the same origin domain
            const escapedOrigin = origin.replace(/[-\/\\^\$*+?.()|[\]{}]/g, '\\$&');
            const originRegex = new RegExp(`(href|src|action)="${escapedOrigin}([^"]*)"`, 'g');
            dataText = dataText.replace(originRegex, `$1="/proxy?url=${origin}$2"`);

            return res.send(dataText);
        }

        // Send binary files (images, multimedia, raw data) completely unaltered
        res.send(response.data);

    } catch (error) {
        res.status(500).send(`Proxy Routing Error: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Proxy running smoothly on port ${PORT}`);
});
