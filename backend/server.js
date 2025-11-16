import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'passkit-generator';
const { PKPass } = pkg;
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const loadCertificates = () => {
    try {
        const certsPath = join(__dirname, './certs')

        return {
            wwdr: readFileSync(join(certsPath, 'AppleWWDRCAG4.pem')),
            signerCert: readFileSync(join(certsPath, 'pass.pem')),
            signerKey: readFileSync(join(certsPath, 'my-key.key')),
            signerKeyPassphrase: process.env.SIGNER_PASSPHRASE || ''
        };
    } catch (error) {
        console.error('Error loading certificates:', error);
        throw error;
    }
};

const loadImages = () => {
    try {
        const modelsPath = join(__dirname, './models');

        return {
            'icon.png': readFileSync(join(modelsPath, 'icon.png')),
            'icon@2x.png': readFileSync(join(modelsPath, 'icon@2x.png')),
            'logo.png': readFileSync(join(modelsPath, 'icon.png')),
            'logo@2x.png': readFileSync(join(modelsPath, 'icon@2x.png'))
        };
    } catch (error) {
        console.error('Error loading images:', error);
        throw error;
    }
};

function hexToRgb(hex) {
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgb(${r}, ${g}, ${b})`;
}

function normalizeColor(color) {
    if (!color) return 'rgb(60, 65, 76)';

    if (color.startsWith('rgb(')) {
        return color;
    }

    if (color.startsWith('#')) {
        return hexToRgb(color);
    }

    if (/^[0-9A-Fa-f]{6}$/.test(color)) {
        return hexToRgb(color);
    }

    return color;
}

async function generatePass(cardData) {
    console.log('Generating pass for card:', cardData.name);

    const certificates = loadCertificates();
    const images = loadImages();

    let bgColor = normalizeColor(cardData.bgColor) || 'rgb(60, 65, 76)';
    let textColor = normalizeColor(cardData.textColor) || 'rgb(255, 255, 255)';

    const pass = new PKPass(
        images,
        {
            signerCert: certificates.signerCert,
            signerKey: certificates.signerKey,
            signerKeyPassphrase: certificates.signerKeyPassphrase,
            wwdr: certificates.wwdr,
        },
        {
            description: `${cardData.name} Loyalty Card`,
            serialNumber: cardData.barcode || `${Date.now()}`,
            passTypeIdentifier: 'pass.sk.polan.alex.control-center',
            teamIdentifier: 'AS5BHHK5AW',
            organizationName: cardData.name,
            foregroundColor: textColor,
            backgroundColor: bgColor,
            logoText: cardData.name,
        }
    );

    if (cardData.barcode) {
        pass.setBarcodes({
            message: cardData.barcode,
            format: 'PKBarcodeFormatCode128',
            messageEncoding: 'iso-8859-1',
        });
    }

    pass.type = 'storeCard';

    if (cardData.memberNumber) {
        pass.primaryFields.push({
            key: 'member',
            label: 'Member Number',
            value: cardData.memberNumber,
            textAlignment: 'PKTextAlignmentLeft',
        });
    }

    if (cardData.cardNumber) {
        pass.secondaryFields.push({
            key: 'cardNumber',
            label: 'Card Number',
            value: cardData.cardNumber,
            textAlignment: 'PKTextAlignmentLeft',
        });
    }

    pass.auxiliaryFields.push({
        key: 'cardType',
        label: 'Card Type',
        value: 'Loyalty Card',
        textAlignment: 'PKTextAlignmentLeft',
    });

    pass.backFields.push(
        {
            key: 'terms',
            label: 'Terms & Conditions',
            value: `This is your ${cardData.name} loyalty card. Present this card at checkout to earn and redeem rewards.`,
            textAlignment: 'PKTextAlignmentLeft',
        },
        {
            key: 'cardInfo',
            label: 'Card Information',
            value: `Card Number: ${cardData.cardNumber || 'N/A'}\nMember Number: ${cardData.memberNumber || 'N/A'}`,
            textAlignment: 'PKTextAlignmentLeft',
        },
        {
            key: 'support',
            label: 'Customer Support',
            value: `For assistance, please visit ${cardData.name} customer service.`,
            textAlignment: 'PKTextAlignmentLeft',
        }
    );

    console.log('Returning pass buffer');
    return pass.getAsBuffer();
}

app.post('/generate-pass', async (req, res) => {
    try {
        const cardData = req.body;

        if (!cardData.name) {
            return res.status(400).json({
                error: 'Missing required field',
                message: 'Card name is required'
            });
        }

        const passBuffer = await generatePass(cardData);
        const filename = `${cardData.name.replace(/[^a-z0-9]/gi, '_')}_loyalty_card.pkpass`;

        res.set({
            'Content-Type': 'application/vnd.apple.pkpass',
            'Content-Disposition': `attachment; filename=${filename}`,
        });

        res.send(passBuffer);
    } catch (error) {
        console.error('Error generating pass:', error);
        res.status(500).json({
            error: 'Failed to generate pass',
            message: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`✅ Passkit Express Server running on port ${PORT}`);
    console.log(`📱 Generate pass at: POST http://localhost:${PORT}/generate-pass`);
    console.log(`❤️  Health check at: http://localhost:${PORT}/health`);
    console.log(`\n📝 Expected POST body format:`);
    console.log(`{
  "name": "Store Name",
  "bgColor": "rgb(255, 0, 0)",
  "textColor": "rgb(255, 255, 255)",
  "barcode": "1234567890",
  "cardNumber": "123 456 789",
  "memberNumber": "123 456 7890"
}`);
});
