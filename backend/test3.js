import fetch from 'node-fetch';

const fetchWithTimeout = (url, options, timeout = 10000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), timeout)
        )
    ]);
};

fetchWithTimeout("https://cdn.brandfetch.io/decathlon.com?c=1idPcHNqxG9p9gPyoFm", {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        "if-none-match": "\"2430-lFIlfVy8+1WwfDTh7CciuoKwbYU\"",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Google Chrome\";v=\"141\", \"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"141\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
    },
    "body": null,
    "method": "GET"
}, 1500) // 15s Timeout
    .then(async (response) => {
        console.log('HTTP Status:', response.status);

        const contentType = response.headers.get('content-type');
        console.log('Brandfetch Content-Type:', contentType);

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Hier machst du weitere Verarbeitung mit buffer

    })
    .catch((error) => {
        console.error('Fetch error or timeout:', error.message);
    });
