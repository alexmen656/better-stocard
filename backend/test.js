// test-brandfetch.js
import fetch from 'node-fetch';

const brandDomain = "decathlon.com";
const clientId = "1idPcHNqxG9p9gPyoFm"; // deinen echten Brandfetch API Key nutzen
const logoUrl = `https://cdn.brandfetch.io/${brandDomain}?c=${clientId}`;

fetch(logoUrl, {
  headers: {
    Referer: "https://deine-app-url.com" // ggf. deinen echten Origin
  }
})
  .then(async (response) => {
    const contentType = response.headers.get('content-type');
    console.log('Brandfetch Content-Type:', contentType);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Zeige die ersten 32 Bytes als Hex-Dump (Format-Check)
    console.log('First 32 bytes:', buffer.slice(0, 32).toString('hex'));

    // Dateiendung grob bestimmen
    if (contentType && contentType.includes('svg')) {
      console.log('SVG detected!');
    } else if (contentType && contentType.includes('webp')) {
      console.log('WebP detected!');
    } else if (contentType && contentType.includes('png')) {
      console.log('PNG detected!');
    } else if (contentType && contentType.includes('jpeg')) {
      console.log('JPEG detected!');
    } else {
      console.log('Unknown or HTML/other detected!');
      // Optional: Dump als UTF-8 falls HTML
      console.log(buffer.slice(0, 200).toString('utf-8'));
      console.log(buffer.slice(0, 10000).toString('utf-8'));

    }
  })
  .catch(err => {
    console.error('Fetch error:', err);
  });
