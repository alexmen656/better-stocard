<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Preferences } from '@capacitor/preferences'
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning'
import { useI18n } from 'vue-i18n'
import companies2 from './companies.json'

const { t } = useI18n()

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
    isCustomCard?: boolean
}

const router = useRouter()
const step = ref<'select-company' | 'enter-barcode' | 'custom-card'>('select-company')
const selectedCompany = ref<Company | null>(null)
const barcode = ref('')
const isScanning = ref(false)
const searchQuery = ref('')
const customCompanyName = ref('')

//const BRAND_FETCH_TOKEN = '1idPcHNqxG9p9gPyoFm'
const SCANNER_ACTIVE_CLASS = 'scanner-active'

const getLogoUrl = (domain: string, size = 256) =>
    `https://cdn.brandfetch.io/${domain}?c=1idPcHNqxG9p9gPyoFm`
//`https://cdn.brandfetch.io/${domain}?c=${BRAND_FETCH_TOKEN}&format=png&w=${size}&h=${size}&fit=contain`

const withDocument = (fn: (doc: Document) => void) => {
    if (typeof document !== 'undefined') {
        fn(document)
    }
}

const setScannerUiState = (active: boolean) => {
    withDocument((doc) => {
        doc.body.classList.toggle(SCANNER_ACTIVE_CLASS, active)
    })
}

const stopNativeScanner = async () => {
    const wasActive =
        isScanning.value ||
        (typeof document !== 'undefined' && document.body.classList.contains(SCANNER_ACTIVE_CLASS))

    setScannerUiState(false)

    if (!wasActive) {
        isScanning.value = false
        return
    }

    try {
        await BarcodeScanner.stopScan()
    } catch (error) {
        console.warn('stopScan failed', error)
    }

    isScanning.value = false
}

const cameraPermissionGranted = (state?: string) => state === 'granted' || state === 'limited'

const ensureCameraPermission = async () => {
    try {
        const status = await BarcodeScanner.checkPermissions()
        if (cameraPermissionGranted(status.camera)) {
            return true
        }

        const request = await BarcodeScanner.requestPermissions()
        if (cameraPermissionGranted(request.camera)) {
            return true
        }
    } catch (error) {
        console.warn('Permission request failed', error)
    }

    console.warn('Camera permission is required to scan barcodes')
    return false
}

const SCAN_FORMATS: BarcodeFormat[] = [
    BarcodeFormat.Code128,
    BarcodeFormat.Code39,
    BarcodeFormat.Code93,
    BarcodeFormat.Ean13,
    BarcodeFormat.Ean8,
    BarcodeFormat.Itf,
    BarcodeFormat.Pdf417,
    BarcodeFormat.QrCode,
    BarcodeFormat.UpcA,
    BarcodeFormat.UpcE,
]

const getInitials = (name: string): string => {
    const trimmed = name.trim()

    if (trimmed.length <= 5) {
        return trimmed.toUpperCase()
    }

    const words = trimmed.split(/\s+/)

    if (words.length === 1) {
        return trimmed.substring(0, 2).toUpperCase()
    }

    return words.map(w => w.charAt(0)).join('').toUpperCase().substring(0, 2)
}

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
                const x = Math.floor(img.width - 10)
                const y = Math.floor(img.height / 2)
                const imageData = ctx.getImageData(x, y, 10, 10)
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

const companies = ref<Company[]>(companies2);

const sortedCompanies = computed(() => {
    return [...companies.value].sort((a, b) => a.name.localeCompare(b.name))
})

const filteredCompanies = computed(() => {
    if (!searchQuery.value.trim()) {
        return sortedCompanies.value
    }
    const query = searchQuery.value.toLowerCase()
    return sortedCompanies.value.filter((company) =>
        company.name.toLowerCase().includes(query)
    )
})

const groupedCompanies = computed(() => {
    const groups: Record<string, Company[]> = {}
    filteredCompanies.value.forEach((company) => {
        const firstChar = company.name.charAt(0).toUpperCase()
        const letter = /[A-Z]/.test(firstChar) ? firstChar : '#'
        if (!groups[letter]) {
            groups[letter] = []
        }
        groups[letter].push(company)
    })
    return Object.keys(groups)
        .sort()
        .map((letter) => ({ letter, companies: groups[letter] }))
})

const isFormValid = computed(() => {
    if (step.value === 'select-company') {
        return selectedCompany.value !== null
    } else if (step.value === 'enter-barcode') {
        return barcode.value.trim().length > 0
    } else if (step.value === 'custom-card') {
        return customCompanyName.value.trim().length > 0
    }
    return false
})

onMounted(async () => {
    for (const company of companies.value) {
        const logoUrl = getLogoUrl(company.logo, 64)
        const bgColor = await extractColorFromImage(logoUrl)
        company.bgColor = bgColor
        company.textColor = getTextColor(bgColor)
    }
})

onUnmounted(() => {
    stopNativeScanner().catch((error) => {
        console.error('Error cleaning up scanner:', error)
    })
})

function selectCompany(company: Company) {
    selectedCompany.value = company
    step.value = 'enter-barcode'
}

function createCustomCard() {
    step.value = 'custom-card'
}

function proceedWithCustomCard() {
    if (!customCompanyName.value.trim()) return
    selectedCompany.value = {
        id: Date.now(),
        name: customCompanyName.value.trim(),
        logo: '',
        bgColor: '#FF6B6B',
        textColor: '#FFFFFF',
    }
    step.value = 'enter-barcode'
}

async function startScanning() {
    if (isScanning.value) return

    const hasPermission = await ensureCameraPermission()
    if (!hasPermission) {
        return
    }

    try {
        isScanning.value = true
        setScannerUiState(true)

        const { barcodes } = await BarcodeScanner.scan({
            formats: SCAN_FORMATS,
        })

        const detectedValue = barcodes?.find((item) => item.displayValue || item.rawValue)
        const nextValue = detectedValue?.displayValue || detectedValue?.rawValue || ''

        if (nextValue) {
            barcode.value = nextValue
        } else {
            console.warn('Scan completed but no readable value was returned', barcodes)
        }
    } catch (error) {
        console.error('Scanning error:', error)
    } finally {
        await stopNativeScanner()
    }
}

function goBack() {
    if (step.value === 'enter-barcode') {
        step.value = 'select-company'
        barcode.value = ''
        selectedCompany.value = null
    } else if (step.value === 'custom-card') {
        step.value = 'select-company'
        customCompanyName.value = ''
    } else {
        router.back()
    }
}

async function saveCard() {
    if (!selectedCompany.value || !barcode.value.trim()) return

    let bgColor = selectedCompany.value.bgColor
    let textColor = selectedCompany.value.textColor
    let isCustomCard = false

    if (selectedCompany.value.logo) {
        const logoUrl = getLogoUrl(selectedCompany.value.logo, 64)
        bgColor = await extractColorFromImage(logoUrl)
        textColor = getTextColor(bgColor)
    } else {
        isCustomCard = true
    }

    const cardNumber = barcode.value; //`${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`
    const memberNumber = `${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`

    const newCard: any = {
        id: Date.now(),
        name: selectedCompany.value.name,
        logo: selectedCompany.value.logo,
        bgColor: bgColor,
        textColor: textColor,
        barcode: barcode.value.replace(/\s+/g, ''),
        cardNumber: cardNumber,
        memberNumber: memberNumber,
        isCustomCard: isCustomCard,
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
            <h1 class="title">{{
                step === 'select-company' ? t('createCard.selectCompany') : step === 'custom-card' ?
                    t('createCard.customCard') : t('createCard.addCard')
            }}</h1>
            <div style="width: 24px"></div>
        </header>
        <div v-if="step === 'select-company'" class="step-content">
            <div class="search-section">
                <input v-model="searchQuery" type="text" class="search-input"
                    :placeholder="t('createCard.searchCompanies')" />
            </div>
            <div class="companies-list">
                <div v-for="group in groupedCompanies" :key="group.letter" class="company-group">
                    <div class="section-header">{{ group.letter }}</div>
                    <div class="companies-grid">
                        <button v-for="company in group.companies" :key="company.id" class="company-card"
                            :style="{ backgroundColor: company.bgColor, color: company.textColor }"
                            @click="selectCompany(company)">
                            <img :src="getLogoUrl(company.logo)" alt=""
                                style="max-width: 100px; max-height: 60px; object-fit: contain;">
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="step === 'custom-card'" class="step-content">
            <div class="step-title">{{ t('createCard.createCustomCard') }}</div>
            <div class="form-section">
                <label for="customName" class="form-label">{{ t('createCard.companyName') }}</label>
                <input id="customName" v-model="customCompanyName" type="text" class="form-input"
                    :placeholder="t('createCard.enterCompanyName')"
                    @keyup.enter="isFormValid && proceedWithCustomCard()" />
                <p class="form-hint">{{ t('createCard.companyNameHint') }}</p>
            </div>
            <button :disabled="!isFormValid" :class="['btn', 'btn-primary', { disabled: !isFormValid }]"
                @click="proceedWithCustomCard">
                {{ t('createCard.continue') }}
            </button>
        </div>
        <div v-else-if="step === 'enter-barcode'" class="step-content">
            <div class="selected-company">
                <div class="company-preview"
                    :style="{ backgroundColor: selectedCompany?.bgColor, color: selectedCompany?.textColor }">
                    <div v-if="selectedCompany?.logo === ''" class="preview-initials">
                        {{ getInitials(selectedCompany?.name || '') }}
                    </div>
                    <img v-else :src="selectedCompany ? getLogoUrl(selectedCompany.logo) : ''" alt=""
                        style="max-width: 150px; max-height: 80px; object-fit: contain;">
                </div>
            </div>
            <div class="form-section">
                <label for="barcode" class="form-label">{{ t('createCard.cardNumberBarcode') }}</label>
                <input id="barcode" v-model="barcode" type="text" class="form-input"
                    :placeholder="t('createCard.enterBarcode')" @keyup.enter="isFormValid && saveCard()" />
                <p class="form-hint">{{ t('createCard.barcodeHint') }}</p>
            </div>
            <button class="scan-button" @click="startScanning" :disabled="isScanning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm10-5h2v4h-2v-4zm4-2h2v2h-2v-2zm0 6h2v2h-2v-2z"
                        fill="currentColor" />
                </svg>
                {{ isScanning ? t('createCard.scanning') : t('createCard.scanBarcode') }}
            </button>
        </div>
        <div class="action-buttons" v-if="step === 'enter-barcode'">
            <button class="btn btn-secondary" @click="goBack">{{ t('createCard.back') }}</button>
            <button :disabled="!isFormValid" :class="['btn', 'btn-primary', { disabled: !isFormValid }]"
                @click="saveCard">
                {{ t('createCard.saveCard') }}
            </button>
        </div>
        <nav class="bottom-nav" v-if="step === 'select-company'">
            <button class="custom-card-button" @click="createCustomCard">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                {{ t('createCard.createCustomCard') }}
            </button>
        </nav>
    </div>
</template>

<style scoped>
* {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    padding: 10px 20px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.create-card-container {
    min-height: 100vh;
    background-color: var(--bg-primary);
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
    padding: 5px 20px;
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 10;
    padding-top: calc(5px + max(0px, env(safe-area-inset-top)));
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
    color: var(--text-primary);
}

.title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
}

.step-content {
    flex: 1;
    padding: 20px;
}

.step-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
}

.search-section {
    margin-bottom: 16px;
}

.search-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #FF6B6B;
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.custom-card-button {
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
    margin-bottom: 24px;
}

.custom-card-button:active {
    transform: scale(0.98);
    background-color: #FFF5F5;
}

.companies-list {
    max-height: calc(100vh - 250px);
    overflow-y: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
}

.company-group {
    margin-bottom: 24px;
}

.section-header {
    font-size: 18px;
    font-weight: 700;
    color: #FF6B6B;
    margin-bottom: 12px;
    padding-left: 4px;
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
    box-shadow: 0 2px 8px var(--shadow-light);
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
    box-shadow: 0 4px 12px var(--shadow-medium);
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
    box-shadow: 0 2px 8px var(--shadow-light);
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
}

.preview-initials {
    font-size: 48px;
    font-weight: 700;
}

.form-section {
    margin-bottom: 20px;
}

.form-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.form-input {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
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
    color: var(--text-muted);
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
    color: var(--text-muted);
    border-color: var(--border-color);
    background-color: var(--bg-primary);
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
