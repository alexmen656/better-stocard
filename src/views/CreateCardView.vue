<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Preferences } from '@capacitor/preferences'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'

interface Company {
    id: number
    name: string
    logo: string
    bgColor: string
    textColor: string
}

interface Card extends Company {
    barcode?: string
    cardNumber?: string
    memberNumber?: string
}

const router = useRouter()
const step = ref<'select-company' | 'enter-barcode'>('select-company')
const selectedCompany = ref<Company | null>(null)
const barcode = ref('')
const isScanning = ref(false)

const extractColorFromImage = (logoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(img, 0, 0)
                const x = Math.floor(img.width - 1)
                const y = Math.floor(img.height / 2)
                const imageData = ctx.getImageData(x, y, 1, 1)
                const data = imageData.data
                const color = `rgb(${data[0]}, ${data[1]}, ${data[2]})`
                resolve(color)
            }
        }
        img.onerror = () => {
            resolve('#E53935')
        }
        img.src = logoUrl
    })
}

const getTextColor = (rgbColor: string): string => {
    const match = rgbColor.match(/\d+/g)
    if (!match || match.length < 3) return '#FFFFFF'
    const r = parseInt(match[0]!)
    const g = parseInt(match[1]!)
    const b = parseInt(match[2]!)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

//static for now
const companies = ref<Company[]>([
    { id: 1, name: 'COOP', logo: 'coop.fr', bgColor: '#E53935', textColor: '#FFFFFF' },
    { id: 2, name: 'ESSELUNGA', logo: 'esselunga.com', bgColor: '#1565C0', textColor: '#FFFFFF' },
    { id: 3, name: 'Carrefour', logo: 'carrefour.com', bgColor: '#0D47A1', textColor: '#FFFFFF' },
    { id: 4, name: '🌼CONAD', logo: 'conad.com', bgColor: '#E53935', textColor: '#FFFFFF' },
    { id: 5, name: 'Media•World', logo: 'mediaworld.com', bgColor: '#C62828', textColor: '#FFFFFF' },
    { id: 6, name: 'IKEA FAMILY', logo: 'ikea.com', bgColor: '#FF9800', textColor: '#FFFFFF' },
    { id: 7, name: 'DECATHLON', logo: 'decathlon.com', bgColor: '#42A5F5', textColor: '#FFFFFF' },
    { id: 8, name: 'TIGOTA', logo: 'tigota.com', bgColor: '#26A69A', textColor: '#FFFFFF' },
    { id: 9, name: 'OVS', logo: 'ovs.com', bgColor: '#212121', textColor: '#FFFFFF' },
    { id: 10, name: 'TUFI', logo: 'tufi.com', bgColor: '#F5F5F5', textColor: '#E91E63' },
    { id: 11, name: 'Lidl', logo: 'lidl.com', bgColor: '#F5F5F5', textColor: '#E91E63' },
    { id: 12, name: 'REWE', logo: 'rewe.de', bgColor: '#E30613', textColor: '#FFFFFF' },
    { id: 13, name: 'ALDI SÜD', logo: 'aldi-sued.de', bgColor: '#003087', textColor: '#FFFFFF' },
    { id: 14, name: 'ALDI NORD', logo: 'aldi-nord.de', bgColor: '#003087', textColor: '#FFFFFF' },
    { id: 15, name: 'EDEKA', logo: 'edeka.de', bgColor: '#00539F', textColor: '#FFFFFF' },
    { id: 16, name: 'PENNY', logo: 'penny.de', bgColor: '#E30613', textColor: '#FFFFFF' },
    { id: 17, name: 'ROSSMANN', logo: 'rossmann.de', bgColor: '#E30613', textColor: '#FFFFFF' },
    { id: 18, name: 'DM', logo: 'dm.de', bgColor: '#009639', textColor: '#FFFFFF' },
    { id: 19, name: 'OBI', logo: 'obi.de', bgColor: '#FF6600', textColor: '#FFFFFF' },
    { id: 20, name: 'SATURN', logo: 'saturn.de', bgColor: '#FF0000', textColor: '#FFFFFF' },
    { id: 21, name: 'MEDIAMARKT', logo: 'mediamarkt.de', bgColor: '#FF0000', textColor: '#FFFFFF' },
    { id: 22, name: 'MÜLLER', logo: 'mueller.de', bgColor: '#FF6600', textColor: '#FFFFFF' },
    { id: 23, name: 'BAUHAUS', logo: 'bauhaus.info', bgColor: '#FF0000', textColor: '#FFFFFF' },
    { id: 24, name: 'Kaufland', logo: 'kaufland.de', bgColor: '#0033A0', textColor: '#FFFFFF' },
    { id: 25, name: 'Globus', logo: 'globus.de', bgColor: '#E30613', textColor: '#FFFFFF' },
    { id: 26, name: 'real', logo: 'real.de', bgColor: '#00703C', textColor: '#FFFFFF' },
    { id: 27, name: 'Thalia', logo: 'thalia.de', bgColor: '#5C2E91', textColor: '#FFFFFF' },
    { id: 28, name: 'H&M', logo: 'hm.com', bgColor: '#FF0000', textColor: '#FFFFFF' },
    { id: 29, name: 'C&A', logo: 'c-and-a.com', bgColor: '#005BAB', textColor: '#FFFFFF' },
    { id: 30, name: 'Peek & Cloppenburg', logo: 'pundc.de', bgColor: '#212121', textColor: '#FFFFFF' },
    { id: 31, name: 'Douglas', logo: 'douglas.de', bgColor: '#E30613', textColor: '#FFFFFF' },
    { id: 32, name: 'Fressnapf', logo: 'fressnapf.de', bgColor: '#FF6600', textColor: '#FFFFFF' },
    { id: 33, name: 'ZooRoyal', logo: 'zooroyal.de', bgColor: '#009639', textColor: '#FFFFFF' },
    { id: 35, name: 'Hagebau', logo: 'hagebau.de', bgColor: '#FF6600', textColor: '#FFFFFF' },
    { id: 36, name: 'Deichmann', logo: 'deichmann.com', bgColor: '#FF0000', textColor: '#FFFFFF' },
    { id: 37, name: 'NKD', logo: 'nkd.com', bgColor: '#FF6600', textColor: '#FFFFFF' },
    { id: 38, name: 'Sconto', logo: 'sconto.de', bgColor: '#FF6600', textColor: '#FFFFFF' },
    { id: 39, name: 'Mömax', logo: 'moemax.de', bgColor: '#FF6600', textColor: '#FFFFFF' },
    { id: 40, name: 'Roller', logo: 'roller.de', bgColor: '#FF6600', textColor: '#FFFFFF' }
])

const isFormValid = computed(() => {
    if (step.value === 'select-company') {
        return selectedCompany.value !== null
    } else if (step.value === 'enter-barcode') {
        return barcode.value.trim().length > 0
    }
    return false
})

onMounted(async () => {
    for (const company of companies.value) {
        const logoUrl = `https://cdn.brandfetch.io/${company.logo}?c=1idPcHNqxG9p9gPyoFm`
        const bgColor = await extractColorFromImage(logoUrl)
        company.bgColor = bgColor
        company.textColor = getTextColor(bgColor)
    }
})

function selectCompany(company: Company) {
    selectedCompany.value = company
    step.value = 'enter-barcode'
}

async function startScanning() {
    try {
        isScanning.value = true
        await BarcodeScanner.checkPermission({ force: true })

        const result = await BarcodeScanner.startScan()

        if (result && result.hasContent) {
            barcode.value = result.content
            isScanning.value = false
        }
    } catch (error) {
        console.error('Scanning error:', error)
        isScanning.value = false
    }
}

function goBack() {
    if (step.value === 'enter-barcode') {
        step.value = 'select-company'
        barcode.value = ''
    } else {
        router.back()
    }
}

async function saveCard() {
    if (!selectedCompany.value || !barcode.value.trim()) return

    const logoUrl = `https://cdn.brandfetch.io/${selectedCompany.value.logo}?c=1idPcHNqxG9p9gPyoFm`
    const bgColor = await extractColorFromImage(logoUrl)
    const textColor = getTextColor(bgColor)

    const cardNumber = `${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`
    const memberNumber = `${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`

    const newCard: Card = {
        id: Date.now(),
        name: selectedCompany.value.name,
        logo: selectedCompany.value.logo,
        bgColor: bgColor,
        textColor: textColor,
        barcode: barcode.value,
        cardNumber: cardNumber,
        memberNumber: memberNumber,
    }

    const { value } = await Preferences.get({ key: 'cards' })
    const existingCards: Card[] = value ? JSON.parse(value) : []

    existingCards.push(newCard)

    await Preferences.set({
        key: 'cards',
        value: JSON.stringify(existingCards),
    })

    router.push('/')
}
</script>

<template>
    <div class="create-card-container">
        <header class="header">
            <button class="back-button" @click="goBack">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="#000" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
            <h1 class="title">{{ step === 'select-company' ? 'Select Company' : 'Add Card' }}</h1>
            <div style="width: 24px"></div>
        </header>
        <div v-if="step === 'select-company'" class="step-content">
            <div class="step-title">Choose a Company</div>
            <div class="companies-grid">
                <button v-for="company in companies" :key="company.name" class="company-card"
                    :style="{ backgroundColor: company.bgColor, color: company.textColor }"
                    @click="selectCompany(company)">
                    <img :src="'https://cdn.brandfetch.io/' + company.logo + '?c=1idPcHNqxG9p9gPyoFm'" alt=""
                        style="max-width: 100px; max-height: 60px; object-fit: contain;">
                </button>
            </div>
        </div>
        <div v-else-if="step === 'enter-barcode'" class="step-content">
            <div class="selected-company">
                <div class="company-preview"
                    :style="{ backgroundColor: selectedCompany?.bgColor, color: selectedCompany?.textColor }">
                    <img :src="'https://cdn.brandfetch.io/' + selectedCompany?.logo + '?c=1idPcHNqxG9p9gPyoFm'" alt=""
                        style="max-width: 150px; max-height: 80px; object-fit: contain;">
                </div>
            </div>
            <div class="form-section">
                <label for="barcode" class="form-label">Card Number / Barcode</label>
                <input id="barcode" v-model="barcode" type="text" class="form-input"
                    placeholder="Enter barcode or card number" @keyup.enter="isFormValid && saveCard()" />
                <p class="form-hint">You can enter the barcode or card number manually. Scanning will be added later.
                </p>
            </div>
            <button class="scan-button" @click="startScanning" :disabled="isScanning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm10-5h2v4h-2v-4zm4-2h2v2h-2v-2zm0 6h2v2h-2v-2z"
                        fill="currentColor" />
                </svg>
                {{ isScanning ? 'Scanning...' : 'Scan Barcode' }}
            </button>
        </div>
        <div class="action-buttons">
            <button v-if="step === 'enter-barcode'" class="btn btn-secondary" @click="goBack">Back</button>
            <button :disabled="!isFormValid" :class="['btn', 'btn-primary', { disabled: !isFormValid }]"
                @click="saveCard">
                {{ step === 'select-company' ? 'Next' : 'Save Card' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
* {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

.create-card-container {
    min-height: 100vh;
    background-color: #F5F5F5;
    display: flex;
    flex-direction: column;
    padding-bottom: 20px;
    /*padding-top: max(0px, env(safe-area-inset-top));*/
    -webkit-user-select: none;
    user-select: none;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: #FFFFFF;
    border-bottom: 1px solid #E0E0E0;
    position: sticky;
    top: 0;
    z-index: 10;
    padding-top: calc(15px + max(0px, env(safe-area-inset-top)));
}

.back-button {
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: #000;
}

.title {
    font-size: 18px;
    font-weight: 600;
    color: #000;
}

.step-content {
    flex: 1;
    padding: 20px;
}

.step-title {
    font-size: 16px;
    font-weight: 600;
    color: #000;
    margin-bottom: 20px;
}

.companies-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.company-card {
    aspect-ratio: 1.2;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 20px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
}

.company-card:active {
    transform: scale(0.95);
}

.company-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.selected-company {
    margin-bottom: 30px;
}

.company-preview {
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #000;
    margin-bottom: 8px;
}

.form-input {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    background-color: #FFFFFF;
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.form-input:focus {
    outline: none;
    border-color: #FF6B6B;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.form-hint {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
}

.scan-button {
    width: 100%;
    padding: 14px;
    font-size: 14px;
    font-weight: 600;
    color: #FF6B6B;
    background-color: #FFFFFF;
    border: 2px solid #FF6B6B;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
}

.scan-button:disabled {
    color: #999;
    border-color: #E0E0E0;
    background-color: #F5F5F5;
    cursor: not-allowed;
}

.scan-button:not(:disabled):active {
    transform: scale(0.98);
}

.action-buttons {
    display: flex;
    gap: 12px;
    padding: 0 20px;
    margin-top: auto;
}

.btn {
    flex: 1;
    padding: 14px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background-color: #FF6B6B;
    color: #FFFFFF;
}

.btn-primary:not(.disabled):active {
    transform: scale(0.98);
}

.btn-primary.disabled {
    background-color: #CCCCCC;
    cursor: not-allowed;
}

.btn-secondary {
    background-color: #FFFFFF;
    color: #FF6B6B;
    border: 2px solid #FF6B6B;
}

.btn-secondary:active {
    background-color: #FFF5F5;
}

@media (min-width: 768px) {
    .companies-grid {
        grid-template-columns: repeat(3, 1fr);
        max-width: 600px;
    }

    .action-buttons {
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
    }
}
</style>
