<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Preferences } from '@capacitor/preferences'

interface Card {
    id: number
    name: string
    bgColor: string
    textColor: string
    barcode?: string
    cardNumber?: string
    memberNumber?: string
}

const router = useRouter()
const step = ref<'select-company' | 'enter-barcode'>('select-company')
const selectedCompany = ref<{ name: string; bgColor: string; textColor: string } | null>(null)
const barcode = ref('')

//static for now
const companies = ref([
    { name: 'COOP', bgColor: '#E53935', textColor: '#FFFFFF' },
    { name: 'ESSELUNGA', bgColor: '#1565C0', textColor: '#FFFFFF' },
    { name: 'Carrefour', bgColor: '#0D47A1', textColor: '#FFFFFF' },
    { name: 'CONAD', bgColor: '#E53935', textColor: '#FFFFFF' },
    { name: 'Media•World', bgColor: '#C62828', textColor: '#FFFFFF' },
    { name: 'IKEA FAMILY', bgColor: '#FF9800', textColor: '#FFFFFF' },
    { name: 'DECATHLON', bgColor: '#42A5F5', textColor: '#FFFFFF' },
    { name: 'TIGOTA', bgColor: '#26A69A', textColor: '#FFFFFF' },
    { name: 'OVS', bgColor: '#212121', textColor: '#FFFFFF' },
    { name: 'TUFI', bgColor: '#F5F5F5', textColor: '#E91E63' },
    { name: 'Lidl', bgColor: '#0066B2', textColor: '#FFFFFF' },
])

const isFormValid = computed(() => {
    if (step.value === 'select-company') {
        return selectedCompany.value !== null
    } else if (step.value === 'enter-barcode') {
        return barcode.value.trim().length > 0
    }
    return false
})

function selectCompany(company: { name: string; bgColor: string; textColor: string }) {
    selectedCompany.value = company
    step.value = 'enter-barcode'
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

    const cardNumber = `${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`
    const memberNumber = `${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`

    const newCard: Card = {
        id: Date.now(),
        name: selectedCompany.value.name,
        bgColor: selectedCompany.value.bgColor,
        textColor: selectedCompany.value.textColor,
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
                    {{ company.name }}
                </button>
            </div>
        </div>
        <div v-else-if="step === 'enter-barcode'" class="step-content">
            <div class="selected-company">
                <div class="company-preview"
                    :style="{ backgroundColor: selectedCompany?.bgColor, color: selectedCompany?.textColor }">
                    {{ selectedCompany?.name }}
                </div>
            </div>
            <div class="form-section">
                <label for="barcode" class="form-label">Card Number / Barcode</label>
                <input id="barcode" v-model="barcode" type="text" class="form-input"
                    placeholder="Enter barcode or card number" @keyup.enter="isFormValid && saveCard()" />
                <p class="form-hint">You can enter the barcode or card number manually. Scanning will be added later.
                </p>
            </div>
            <button class="scan-button" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3h6v6H3V3zm12 0h6v6h-6V3zM3 15h6v6H3v-6zm10-5h2v4h-2v-4zm4-2h2v2h-2v-2zm0 6h2v2h-2v-2z"
                        fill="currentColor" />
                </svg>
                Scan (Coming Soon)
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
.create-card-container {
    min-height: 100vh;
    background-color: #F5F5F5;
    display: flex;
    flex-direction: column;
    padding-bottom: 20px;
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
    color: #999;
    background-color: #FFFFFF;
    border: 2px solid #E0E0E0;
    border-radius: 8px;
    cursor: not-allowed;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
}

.scan-button:not(:disabled) {
    color: #FF6B6B;
    border-color: #FF6B6B;
    cursor: pointer;
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
