<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ScreenBrightness } from '@capacitor-community/screen-brightness';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { CapacitorPassToWallet } from 'capacitor-pass-to-wallet';
//import AppleWalletBadge from './icons/AppleWalletBadge.vue';
//import VueBarcode from 'vue-barcode';
import VueBarcode from '@chenfengyuan/vue-barcode';

interface Props {
    card: {
        id: number
        name: string
        logo: string
        bgColor: string
        textColor: string
        barcode?: string
        cardNumber?: string
        memberNumber?: string
        photoFront?: string
        photoBack?: string
    }
}

/*async function get(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    if (!base64 || base64 instanceof ArrayBuffer) {
        throw new Error(`Unable to get ${url}`);
    }
    return base64;
}*/

function blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsDataURL(blob);
    });
}

async function addToWallet() {
    try {
        const cardPayload = {
            name: props.card.name,
            logo: props.card.logo,
            bgColor: props.card.bgColor,
            textColor: props.card.textColor,
            barcode: props.card.barcode || cardNumber.value.replace(/\s/g, ''),
            cardNumber: cardNumber.value,
            memberNumber: memberNumber.value
        };

        const response = await fetch('https://better-stocard.reelmia.com/generate-pass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cardPayload)
        });

        if (!response.ok) {
            throw new Error(`Failed to generate pass: ${response.statusText}`);
        }

        const blob = await response.blob();
        const base64 = await blobToBase64(blob);

        if (!base64 || base64 instanceof ArrayBuffer) {
            throw new Error('Unable to convert pass to base64');
        }

        await CapacitorPassToWallet.addToWallet({ base64: base64 });
    } catch (error) {
        console.error('Error adding to wallet:', error);
        alert('Failed to add card to wallet. Please try again.');
    }
}

const props = defineProps<Props>()
const emit = defineEmits<{
    close: []
    updateCard: [card: any]
}>()

const barcodePattern = ref(props.card.barcode)
const showMenu = ref(false)
const showPhotosSection = ref(false)
const photoFront = ref(props.card.photoFront || '')
const photoBack = ref(props.card.photoBack || '')
const fileInputFront = ref<HTMLInputElement | null>(null)
const fileInputBack = ref<HTMLInputElement | null>(null)

const cardNumber = ref(props.card.cardNumber || '')// || generateCardNumber()
const memberNumber = ref(props.card.memberNumber || '') // || generateMemberNumber()

/*function generateCardNumber(): string {
    return `${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`
}

function generateMemberNumber(): string {
    return `${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`
}*/

onMounted(async () => {
    try {
        await loadPhotos()
        setTimeout(async () => {
            await ScreenBrightness.setBrightness({ brightness: 1.0 });
        }, 500);
    } catch (error) {
        console.error('Error setting screen brightness:', error);
    }
});

function handlePhotoFrontChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
            photoFront.value = e.target?.result as string
            await savePhotos()
        }
        reader.readAsDataURL(file)
    }
}

function handlePhotoBackChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = async (e) => {
            photoBack.value = e.target?.result as string
            await savePhotos()
        }
        reader.readAsDataURL(file)
    }
}

async function savePhotos() {
    try {
        const cardFolderId = `card_${props.card.id}`

        await Filesystem.mkdir({
            path: cardFolderId,
            directory: Directory.Data,
            recursive: true,
        })

        if (photoFront.value) {
            await Filesystem.writeFile({
                path: `${cardFolderId}/front.jpg`,
                data: photoFront.value,
                directory: Directory.Data,
            })
        }

        if (photoBack.value) {
            await Filesystem.writeFile({
                path: `${cardFolderId}/back.jpg`,
                data: photoBack.value,
                directory: Directory.Data,
            })
        }

        updateCardPhoto()
    } catch (error) {
        console.error('Error saving photos:', error)
    }
}

async function loadPhotos() {
    try {
        const cardFolderId = `card_${props.card.id}`

        try {
            const frontData = await Filesystem.readFile({
                path: `${cardFolderId}/front.jpg`,
                directory: Directory.Data,
            })
            photoFront.value = `data:image/jpeg;base64,${frontData.data}`
        } catch {
            photoFront.value = ''
        }

        try {
            const backData = await Filesystem.readFile({
                path: `${cardFolderId}/back.jpg`,
                directory: Directory.Data,
            })
            photoBack.value = `data:image/jpeg;base64,${backData.data}`
        } catch {
            photoBack.value = ''
        }
    } catch (error) {
        console.error('Error loading photos:', error)
    }
}

function updateCardPhoto() {
    emit('updateCard', {
        ...props.card,
        photoFront: photoFront.value,
        photoBack: photoBack.value
    })
}

function triggerPhotoFrontUpload() {
    fileInputFront.value?.click()
}

function triggerPhotoBackUpload() {
    fileInputBack.value?.click()
}

async function removePhotoFront() {
    try {
        const cardFolderId = `card_${props.card.id}`
        await Filesystem.deleteFile({
            path: `${cardFolderId}/front.jpg`,
            directory: Directory.Data,
        })

        photoFront.value = ''
        updateCardPhoto()
    } catch (error) {
        console.error('Error removing front photo:', error)
    }
}

async function removePhotoBack() {
    try {
        const cardFolderId = `card_${props.card.id}`
        await Filesystem.deleteFile({
            path: `${cardFolderId}/back.jpg`,
            directory: Directory.Data,
        })

        photoBack.value = ''
        updateCardPhoto()
    } catch (error) {
        console.error('Error removing back photo:', error)
    }
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
                <div class="menu-wrapper">
                    <button class="menu-button" @click="showMenu = !showMenu">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="6" r="1.5" fill="#000" />
                            <circle cx="12" cy="12" r="1.5" fill="#000" />
                            <circle cx="12" cy="18" r="1.5" fill="#000" />
                        </svg>
                    </button>
                    <div class="dropdown-menu" v-if="showMenu">
                        <button class="menu-item" @click="showPhotosSection = true; showMenu = false">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                                    stroke="currentColor" stroke-width="2" />
                                <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2" />
                            </svg>
                            Add Photos
                        </button>
                    </div>
                </div>
            </header>
            <div class="card-content">
                <div v-if="showPhotosSection" class="photos-section">
                    <div class="photos-header">
                        <h2>Card Photos</h2>
                        <button class="close-photos-btn" @click="showPhotosSection = false">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="#000" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <div class="photo-upload-container">
                        <div class="photo-item">
                            <h3>Front</h3>
                            <div v-if="photoFront" class="photo-preview">
                                <img :src="photoFront" alt="Front" />
                                <button class="remove-photo-btn" @click="removePhotoFront">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6L6 18M6 6l12 12" stroke="#FF4444" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            </div>
                            <button v-else class="upload-btn" @click="triggerPhotoFrontUpload">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5v14M5 12h14" stroke="#999" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                                <span>Upload Photo</span>
                            </button>
                            <input ref="fileInputFront" type="file" accept="image/*" @change="handlePhotoFrontChange"
                                style="display: none" />
                        </div>
                        <div class="photo-item">
                            <h3>Back</h3>
                            <div v-if="photoBack" class="photo-preview">
                                <img :src="photoBack" alt="Back" />
                                <button class="remove-photo-btn" @click="removePhotoBack">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18 6L6 18M6 6l12 12" stroke="#FF4444" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            </div>
                            <button v-else class="upload-btn" @click="triggerPhotoBackUpload">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 5v14M5 12h14" stroke="#999" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                                <span>Upload Photo</span>
                            </button>
                            <input ref="fileInputBack" type="file" accept="image/*" @change="handlePhotoBackChange"
                                style="display: none" />
                        </div>
                    </div>
                </div>
                <div v-if="!showPhotosSection">
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
                            <!--   <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" class="barcode-svg">
                                <g>
                                    <rect v-for="(bar, index) in barcodePattern" :key="index" :x="index * 4" y="0"
                                        :width="bar ? 3 : 1" height="60" fill="#000" />
                                </g>
                            </svg>-->
                            <vue-barcode :value="barcodePattern"
                                :options="{ format: 'CODE128', lineColor: '#000', width: 2, height: 70, displayValue: false }"
                                class="barcode-svg" />
                        </div>
                        <div class="card-number">{{ cardNumber }}</div>
                        <!--<div class="member-number">{{ memberNumber }}</div>-->
                    </div>
                    <div class="add-to-wallet-section">
                        <button class="add-to-wallet-btn" @click="addToWallet">
                            <img src="./icons/wallet.svg" alt="Add to Wallet" style="width: 200px; height: auto;" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.add-to-wallet-section {
    display: flex;
    justify-content: center;
    align-items: center;
}

.add-to-wallet-btn {
    border: none;
    background-color: transparent;
}

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
    display: flex;
    flex-direction: column;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background-color: #FFFFFF;
    border-bottom: 1px solid #E0E0E0;
    padding-top: calc(15px + max(0px, env(safe-area-inset-top)));
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

.menu-wrapper {
    position: relative;
}

.dropdown-menu {
    position: absolute;
    top: 40px;
    right: 0;
    background-color: #FFFFFF;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 200px;
    z-index: 100;
    overflow: hidden;
    animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.menu-item {
    width: 100%;
    padding: 12px 16px;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.2s;
}

.menu-item:hover {
    background-color: #F5F5F5;
}

.detail-title {
    font-size: 18px;
    font-weight: 600;
    color: #000;
}

.card-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
    flex: 1;
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
    margin-bottom: 20px;
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
    margin-bottom: 20px;
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

.photos-section {
    animation: fadeIn 0.2s ease-out;
}

.photos-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #E0E0E0;
}

.photos-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #000;
    margin: 0;
}

.close-photos-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.photo-upload-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.photo-item {
    background-color: #FFFFFF;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.photo-item h3 {
    font-size: 14px;
    font-weight: 600;
    color: #666;
    margin: 0 0 15px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.photo-preview {
    position: relative;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
}

.photo-preview img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
}

.remove-photo-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.9);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: background-color 0.2s;
}

.remove-photo-btn:hover {
    background-color: rgba(255, 255, 255, 1);
}

.upload-btn {
    width: 100%;
    padding: 30px 20px;
    border: 2px dashed #D0D0D0;
    border-radius: 8px;
    background-color: #FAFAFA;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 14px;
    color: #666;
    transition: all 0.2s;
}

.upload-btn:hover {
    border-color: #999;
    background-color: #F5F5F5;
}

.upload-btn:active {
    background-color: #EFEFEF;
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
