//const axios = require('axios');
//const fs = require('fs');

import axios from 'axios';
import fs from 'fs';

const url = 'https://cdn.brandfetch.io/decathlon.com?c=1idPcHNqxG9p9gPyoFm';
const outputPath = './decathlon-logo.webp';

(async () => {
    try {
        const response = await axios.get(url, {
            responseType: 'stream',
            headers: {
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
                'Referer': 'https://your-website.com' // optional falls Brandfetch das verlangt
            }
        });

        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log(`Logo saved to ${outputPath}`);
        });

        writer.on('error', (err) => {
            console.error('Error writing file:', err);
        });

    } catch (error) {
        console.error('Fetch error:', error.message);
    }
})();
