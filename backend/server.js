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
        const certsPath = join(__dirname, './certs');

        return {
            wwdr: readFileSync(join(certsPath, 'AppleWWDRCAG4.pem')),
            signerCert: readFileSync(join(certsPath, 'signerCert.pem')),
            signerKey: readFileSync(join(certsPath, 'signerKey.pem')),
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
            'footer.png': readFileSync(join(modelsPath, 'footer.png')),
            'footer@2x.png': readFileSync(join(modelsPath, 'footer@2x.png')),
            'background@2x.png': readFileSync(join(modelsPath, 'background@2x.png'))
        };
    } catch (error) {
        console.error('Error loading images:', error);
        throw error;
    }
};

async function generatePass() {
    console.log('Generating pass');

    const certificates = loadCertificates();
    const images = loadImages();

    const pass = new PKPass(
        images,
        {
            signerCert: certificates.signerCert,
            signerKey: certificates.signerKey,
            signerKeyPassphrase: certificates.signerKeyPassphrase,
            wwdr: certificates.wwdr,
        },
        {
            description: 'Ionic Pass',
            serialNumber: '81592CQ7838',
            passTypeIdentifier: 'pass.io.ionic.example',
            teamIdentifier: 'AS5BHHK5AW',
            organizationName: 'Apple Inc.',
            foregroundColor: 'rgb(255, 255, 255)',
            backgroundColor: 'rgb(60, 65, 76)',
        }
    );

    pass.setBarcodes('1276451828321');
    pass.type = 'boardingPass';
    pass.transitType = 'PKTransitTypeAir';

    pass.headerFields.push(
        {
            key: 'header1',
            label: 'Date',
            value: '14th Nov',
            textAlignment: 'PKTextAlignmentCenter',
        },
        {
            key: 'header2',
            label: 'UID',
            value: 'EZY997',
            textAlignment: 'PKTextAlignmentCenter',
        }
    );

    pass.primaryFields.push(
        {
            key: 'IATA-source',
            value: 'LAS',
            label: 'Las Vegas',
            textAlignment: 'PKTextAlignmentLeft',
        },
        {
            key: 'IATA-destination',
            value: 'LAX',
            label: 'Los Angeles',
            textAlignment: 'PKTextAlignmentRight',
        }
    );

    pass.secondaryFields.push(
        {
            key: 'secondary1',
            label: 'Boarding',
            value: '18:40',
            textAlignment: 'PKTextAlignmentCenter',
        },
        {
            key: 'sec2',
            label: 'Departing',
            value: '19:10',
            textAlignment: 'PKTextAlignmentCenter',
        },
        {
            key: 'sec3',
            label: 'Group',
            value: 'A',
            textAlignment: 'PKTextAlignmentCenter',
        },
        {
            key: 'sec4',
            label: 'Special',
            value: '1 Carry On',
            textAlignment: 'PKTextAlignmentCenter',
        }
    );

    pass.auxiliaryFields.push(
        {
            key: 'aux1',
            label: 'Passenger',
            value: 'John Smith',
            textAlignment: 'PKTextAlignmentLeft',
        },
        {
            key: 'aux2',
            label: 'Seat',
            value: '1A',
            textAlignment: 'PKTextAlignmentCenter',
        }
    );

    pass.backFields.push(
        {
            key: "document number",
            label: "Numero documento:",
            value: "- -",
            textAlignment: "PKTextAlignmentLeft",
        },
        {
            key: "You're checked in, what next",
            label: "Hai effettuato il check-in, Quali sono le prospettive",
            value: "",
            textAlignment: "PKTextAlignmentLeft",
        },
        {
            key: "Check In",
            label: "1. check-in✓",
            value: "",
            textAlignment: "PKTextAlignmentLeft",
        },
        {
            key: "checkIn",
            label: "",
            value: "Le uscite d'imbarco chiudono 30 minuti prima della partenza, quindi sii puntuale. In questo aeroporto puoi utilizzare la corsia Fast Track ai varchi di sicurezza.",
            textAlignment: "PKTextAlignmentLeft",
        },
        {
            key: "2. Bags",
            label: "2. Bagaglio",
            value: "",
            textAlignment: "PKTextAlignmentLeft",
        },
        {
            key: "Require special assistance",
            label: "Assistenza speciale",
            value: "Se hai richiesto assistenza speciale, presentati a un membro del personale nell'area di Consegna bagagli almeno 90 minuti prima del volo.",
            textAlignment: "PKTextAlignmentLeft",
        },
        {
            key: "3. Departures",
            label: "3. Partenze",
            value: "",
            textAlignment: "PKTextAlignmentLeft",
        },
        {
            key: "photoId",
            label: "Un documento d’identità corredato di fotografia",
            value: "è obbligatorio su TUTTI i voli. Per un viaggio internazionale è necessario un passaporto valido o, dove consentita, una carta d’identità.",
            textAlignment: "PKTextAlignmentLeft",
        },
        {
            key: "yourSeat",
            label: "Il tuo posto:",
            value: "verifica il tuo numero di posto nella parte superiore. Durante l’imbarco utilizza le scale anteriori e posteriori: per le file 1-10 imbarcati dalla parte anteriore; per le file 11-31 imbarcati dalla parte posteriore. Colloca le borse di dimensioni ridotte sotto il sedile davanti a te.",
            textAlignment: "PKTextAlignmentLeft",
        },
        {
            key: "Pack safely",
            label: "Bagaglio sicuro",
            value: "Fai clic http://easyjet.com/it/articoli-pericolosi per maggiori informazioni sulle merci pericolose oppure visita il sito CAA http://www.caa.co.uk/default.aspx?catid=2200",
            textAlignment: "PKTextAlignmentLeft",
        },
        {
            key: "Thank you for travelling easyJet",
            label: "Grazie per aver viaggiato con easyJet",
            value: "",
            textAlignment: "PKTextAlignmentLeft",
        },
    );

    console.log('Returning pass buffer');
    return pass.getAsBuffer();
}

app.get('/generate-pass', async (req, res) => {
    try {
        const passBuffer = await generatePass();

        res.set({
            'Content-Type': 'application/vnd.apple.pkpass',
            'Content-Disposition': 'attachment; filename=myPass.pkpass',
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
    console.log(`📱 Generate pass at: http://localhost:${PORT}/generate-pass`);
    console.log(`❤️  Health check at: http://localhost:${PORT}/health`);
});
