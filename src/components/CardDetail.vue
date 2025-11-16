<script setup lang="ts">
import { ref } from 'vue'

interface Props {
    card: {
        id: number
        name: string
        bgColor: string
        textColor: string
        barcode?: string
        cardNumber?: string
        memberNumber?: string
    }
}

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
}>()

const barcodePattern = ref(generateBarcodePattern())

function generateBarcodePattern(): number[] {
    const pattern = []
    for (let i = 0; i < 50; i++) {
        pattern.push(Math.random() > 0.5 ? 1 : 0)
    }
    return pattern
}

const cardNumber = ref(props.card.cardNumber || generateCardNumber())
const memberNumber = ref(props.card.memberNumber || generateMemberNumber())

function generateCardNumber(): string {
    return `${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`
}

function generateMemberNumber(): string {
    return `${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`
}
</script>

<template>
    <div class="card-detail-overlay" @click="emit('close')">
        <div class="card-detail-container" @click.stop>
            <header class="detail-header">
                <button class="back-button" @click="emit('close')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="#000" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                    </svg>
                </button>
                <h1 class="detail-title">{{ card.name }}</h1>
                <button class="menu-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="6" r="1.5" fill="#000" />
                        <circle cx="12" cy="12" r="1.5" fill="#000" />
                        <circle cx="12" cy="18" r="1.5" fill="#000" />
                    </svg>
                </button>
            </header>
            <div class="card-content">
                <div class="card-display" :style="{ backgroundColor: card.bgColor, color: card.textColor }">
                    <div class="card-logo">
                        <div class="logo-placeholder">
                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M30 50L40 40L50 50M40 40V60M20 30C20 25.5817 23.5817 22 28 22H52C56.4183 22 60 25.5817 60 30V50C60 54.4183 56.4183 58 52 58H28C23.5817 58 20 54.4183 20 50V30Z"
                                    :stroke="card.textColor" stroke-width="3" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div class="card-brand-name">{{ card.name }}</div>
                    </div>
                </div>
                <div class="barcode-section">
                    <div class="barcode">
                        <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" class="barcode-svg">
                            <g>
                                <rect v-for="(bar, index) in barcodePattern" :key="index" :x="index * 4" y="0"
                                    :width="bar ? 3 : 1" height="60" fill="#000" />
                            </g>
                        </svg>
                    </div>
                    <div class="card-number">{{ cardNumber }}</div>
                    <div class="member-number">{{ memberNumber }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.card-detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.card-detail-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #F5F5F5;
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

/* Header */
.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: #FFFFFF;
    border-bottom: 1px solid #E0E0E0;
}

.back-button,
.menu-button {
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.detail-title {
    font-size: 18px;
    font-weight: 600;
    color: #000;
}

/* Card Content */
.card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.card-display {
    border-radius: 16px;
    padding: 40px 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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

.card-brand-name {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 1px;
    text-align: center;
}

/* Barcode Section */
.barcode-section {
    background-color: #FFFFFF;
    border-radius: 16px;
    padding: 30px 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.barcode {
    width: 100%;
    max-width: 300px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.barcode-svg {
    width: 100%;
    height: 100%;
}

.card-number {
    font-size: 20px;
    font-weight: 600;
    color: #000;
    letter-spacing: 1px;
}

.member-number {
    font-size: 16px;
    color: #999;
    letter-spacing: 0.5px;
}

@media (min-width: 768px) {
    .card-detail-container {
        left: 50%;
        transform: translateX(-50%);
        max-width: 500px;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.3);
    }

    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(100%);
        }

        to {
            transform: translateX(-50%) translateY(0);
        }
    }
}
</style>
