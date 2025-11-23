<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'
import VueBarcode from '@chenfengyuan/vue-barcode'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

interface CardData {
    name: string
    logo: string
    bgColor: string
    textColor: string
    barcode: string
    cardNumber: string
    isCustomCard?: boolean
}

const cardData = ref<CardData | null>(null)
const error = ref('')
const loading = ref(true)

onMounted(async () => {
    try {
        await decryptCard()
    } catch (err) {
        console.error('Error decrypting card:', err)
        error.value = t('shareReceive.decryptionError')
    } finally {
        loading.value = false
    }
})

async function decryptCard() {
    const encryptedData = route.query.d as string
    if (!encryptedData) {
        error.value = t('shareReceive.invalidLink')
        return
    }

    const keyBase64 = window.location.hash.slice(1)
    if (!keyBase64) {
        error.value = t('shareReceive.missingKey')
        return
    }

    const base64ToBytes = (str: string) => {
        const padded = str + '='.repeat((4 - str.length % 4) % 4)
        const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
        return naclUtil.decodeBase64(base64)
    }

    const fullMessage = base64ToBytes(encryptedData)
    const key = base64ToBytes(keyBase64)

    const nonce = fullMessage.slice(0, nacl.secretbox.nonceLength)
    const encrypted = fullMessage.slice(nacl.secretbox.nonceLength)

    const decrypted = nacl.secretbox.open(encrypted, nonce, key)
    if (!decrypted) {
        error.value = t('shareReceive.decryptionFailed')
        return
    }

    const jsonString = naclUtil.encodeUTF8(decrypted)
    cardData.value = JSON.parse(jsonString)
}

function saveCard() {
    if (!cardData.value) return

    const existingCards = JSON.parse(localStorage.getItem('cards') || '[]')
    const newId = existingCards.length > 0
        ? Math.max(...existingCards.map((c: any) => c.id)) + 1
        : 1

    const newCard = {
        id: newId,
        name: cardData.value.name,
        logo: cardData.value.logo,
        bgColor: cardData.value.bgColor,
        textColor: cardData.value.textColor,
        barcode: cardData.value.barcode,
        cardNumber: cardData.value.cardNumber,
        isCustomCard: cardData.value.isCustomCard || false
    }

    existingCards.push(newCard)
    localStorage.setItem('cards', JSON.stringify(existingCards))

    router.push('/')
}

function getInitials(name: string): string {
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
</script>

<template>
    <div class="share-receive-container">
        <div class="content">
            <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>{{ t('shareReceive.decrypting') }}</p>
            </div>

            <div v-else-if="error" class="error-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#FF4444" stroke-width="2" />
                    <path d="M12 8v4M12 16h.01" stroke="#FF4444" stroke-width="2" stroke-linecap="round" />
                </svg>
                <h2>{{ t('shareReceive.errorTitle') }}</h2>
                <p>{{ error }}</p>
                <button class="back-btn" @click="router.push('/')">
                    {{ t('shareReceive.backToHome') }}
                </button>
            </div>

            <div v-else-if="cardData" class="success-state">
                <h1>{{ t('shareReceive.cardReceived') }}</h1>
                <p class="subtitle">{{ t('shareReceive.cardReceivedDescription') }}</p>

                <div class="card-preview" :style="{ backgroundColor: cardData.bgColor, color: cardData.textColor }">
                    <div class="card-logo">
                        <div v-if="cardData.isCustomCard" class="logo-initials">
                            {{ getInitials(cardData.name) }}
                        </div>
                        <div v-else class="logo-placeholder">
                            <img :src="'https://cdn.brandfetch.io/' + cardData.logo + '?c=1idPcHNqxG9p9gPyoFm'" alt=""
                                style="max-width: 120px; max-height: 100px; object-fit: contain;">
                        </div>
                        <div class="card-brand-name">{{ cardData.name }}</div>
                    </div>
                </div>

                <div class="barcode-preview">
                    <vue-barcode :value="cardData.barcode"
                        :options="{ format: 'CODE128', lineColor: '#000', width: 2, height: 70, displayValue: false }"
                        class="barcode-svg" />
                    <div class="card-number">{{ cardData.cardNumber }}</div>
                </div>

                <div class="action-buttons">
                    <button class="save-btn" @click="saveCard">
                        {{ t('shareReceive.saveCard') }}
                    </button>
                    <button class="cancel-btn" @click="router.push('/')">
                        {{ t('shareReceive.cancel') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.share-receive-container {
    min-height: 100vh;
    background-color: var(--bg-primary);
    display: flex;
    flex-direction: column;
    padding: 20px;
    padding-top: calc(20px + max(0px, env(safe-area-inset-top)));
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
}

.loading-state,
.error-state,
.success-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    text-align: center;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border-color);
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error-state svg {
    margin-bottom: 10px;
}

.error-state h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.error-state p {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;
}

.back-btn,
.cancel-btn {
    padding: 12px 24px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.back-btn:hover,
.cancel-btn:hover {
    background: var(--border-subtle);
}

.success-state h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0;
}

.card-preview {
    border-radius: 16px;
    padding: 40px 30px;
    box-shadow: 0 4px 12px var(--shadow-medium);
    min-height: 220px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
}

.card-logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.logo-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-initials {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: 700;
    width: 120px;
    height: 120px;
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.2);
    text-align: center;
}

.card-brand-name {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 1px;
    text-align: center;
}

.barcode-preview {
    background-color: var(--bg-secondary);
    border-radius: 16px;
    padding: 30px 20px;
    box-shadow: 0 2px 8px var(--shadow-light);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    width: 100%;
}

.barcode-svg {
    width: 100%;
    max-width: 300px;
    height: 80px;
}

.card-number {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 1px;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    margin-top: 20px;
}

.save-btn {
    padding: 15px 30px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

@media (min-width: 768px) {
    .action-buttons {
        flex-direction: row;
        justify-content: center;
    }
}
</style>
