import express from 'express';
import path from 'path';
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/share/card/:id', (req, res) => {
    const cardId = req.params.id;
    const cardData = req.query.data;

    res.send(`
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pocketz - Karte teilen</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px 30px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .logo {
            font-size: 60px;
            margin-bottom: 20px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
        }
        
        p {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .btn {
            display: inline-block;
            padding: 15px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            margin: 10px 0;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .stores {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 20px;
        }
        
        .store-badge {
            height: 50px;
        }
        
        #status {
            margin-top: 20px;
            color: #999;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">📇</div>
        <h1>Kundenkarte geteilt!</h1>
        <p>Öffne diese Karte in der Pocketz App, um sie zu speichern.</p>
        
        <a href="#" id="openApp" class="btn">Pocketz öffnen</a>
        
        <div class="stores">
            <a href="https://apps.apple.com/app/pocketz/YOURAPPID" target="_blank">
                <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/de-de?size=250x83" 
                     alt="Download on App Store" class="store-badge">
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.yourname.pocketz" target="_blank">
                <img src="https://play.google.com/intl/en_us/badges/static/images/badges/de_badge_web_generic.png" 
                     alt="Get it on Google Play" class="store-badge">
            </a>
        </div>
        
        <p id="status"></p>
    </div>

    <script>
        const appUrl = 'pocketz://share/card/${cardId}${cardData ? '?data=' + cardData : ''}';
        const webUrl = window.location.href;
        
        let appOpened = false;
        let startTime = Date.now();
        
        function tryOpenApp() {
            document.getElementById('status').textContent = 'Versuche App zu öffnen...';
            window.location.href = appUrl;
            
            setTimeout(() => {
                const timeElapsed = Date.now() - startTime;
                
                if (timeElapsed < 2500) {
                    document.getElementById('status').textContent = 
                        'App nicht gefunden. Bitte lade Pocketz herunter!';
                }
            }, 2000);
        }
        
        window.addEventListener('load', () => {
            setTimeout(tryOpenApp, 500);
        });
        
        document.getElementById('openApp').addEventListener('click', (e) => {
            e.preventDefault();
            startTime = Date.now();
            tryOpenApp();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                const timeElapsed = Date.now() - startTime;
                if (timeElapsed > 2500) {
                    appOpened = true;
                    document.getElementById('status').textContent = 
                        'App wurde geöffnet! Du kannst dieses Fenster schließen.';
                }
            }
        });
    </script>
</body>
</html>
  `);
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pocketz - Deine Kundenkarten</title>
</head>
<body style="font-family: -apple-system; text-align: center; padding: 50px;">
    <h1>Pocketz</h1>
    <p>Alle deine Kundenkarten, immer dabei.</p>
    <a href="https://apps.apple.com/app/pocketz/YOURAPPID">Download on App Store</a>
</body>
</html>
  `);
});

app.use((req, res) => {
    res.status(404).send('404 - Not Found');
});

app.listen(PORT, () => {
    console.log(`🚀 Pocketz Server running on http://localhost:${PORT}`);
    console.log(`📱 AASA file: http://localhost:${PORT}/.well-known/apple-app-site-association`);
    console.log(`🔗 Test link: http://localhost:${PORT}/share/card/test123`);
});