<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ScreenBrightness } from '@capacitor-community/screen-brightness';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { CapacitorPassToWallet } from 'capacitor-pass-to-wallet';
import VueBarcode from '@chenfengyuan/vue-barcode';
//import QrcodeVue from 'qrcode.vue';
import { useI18n } from 'vue-i18n';
import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import QRCode from 'qrcode';

const { t } = useI18n();

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
        isCustomCard?: boolean
    }
}

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
            cardNumber: props.card.name,//cardNumber.value,
            memberNumber: cardNumber.value //memberNumber.value
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
        alert(t('cardDetail.failedToAddToWallet'));
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
const showShareScreen = ref(false)
const showPhotosGallery = ref(false)
const expandPhotos = ref(false)
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const shareUrl = ref('')
const selectedPhotoModal = ref<string | null>(null)
const photoFront = ref(props.card.photoFront || '')
const photoBack = ref(props.card.photoBack || '')
const fileInputFront = ref<HTMLInputElement | null>(null)
const fileInputBack = ref<HTMLInputElement | null>(null)
const cardNumber = ref(props.card.cardNumber || '')
//const memberNumber = ref(props.card.memberNumber || '')

async function generateShareLink() {
    try {
        const key = nacl.randomBytes(nacl.secretbox.keyLength)

        const cardData = {
            name: props.card.name,
            logo: props.card.logo,
            bgColor: props.card.bgColor,
            textColor: props.card.textColor,
            barcode: props.card.barcode || cardNumber.value.replace(/\s/g, ''),
            cardNumber: cardNumber.value,
            isCustomCard: props.card.isCustomCard
        }

        const messageBytes = naclUtil.decodeUTF8(JSON.stringify(cardData))
        const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
        const encrypted = nacl.secretbox(messageBytes, nonce, key)

        const fullMessage = new Uint8Array(nonce.length + encrypted.length)
        fullMessage.set(nonce)
        fullMessage.set(encrypted, nonce.length)

        const base64 = naclUtil.encodeBase64(fullMessage)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '')

        const keyBase64 = naclUtil.encodeBase64(key)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '')

        shareUrl.value = `https://share.pocketz.reelmia.com/share?d=${base64}#${keyBase64}`

        if (qrCanvas.value) {
            await QRCode.toCanvas(qrCanvas.value, shareUrl.value, {
                width: 280,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })
        }
    } catch (error) {
        console.error('Error generating share link:', error)
        alert(t('cardDetail.failedToGenerateShare'))
    }
}

function copyLink() {
    if (shareUrl.value) {
        navigator.clipboard.writeText(shareUrl.value)
        alert(t('cardDetail.linkCopied'))
    }
}

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

function openPhotoModal(photo: string) {
    selectedPhotoModal.value = photo
}

function closePhotoModal() {
    selectedPhotoModal.value = null
}

async function deleteCard() {
    if (confirm(t('cardDetail.confirmDelete'))) {
        try {
            const cardFolderId = `card_${props.card.id}`

            try {
                await Filesystem.deleteFile({
                    path: `${cardFolderId}/front.jpg`,
                    directory: Directory.Data,
                })
            } catch (error) {
                //console.error('Error deleting front photo:', error)
            }

            try {
                await Filesystem.deleteFile({
                    path: `${cardFolderId}/back.jpg`,
                    directory: Directory.Data,
                })
            } catch (error) {
                //console.error('Error deleting back photo:', error)
            }

            try {
                await Filesystem.rmdir({
                    path: cardFolderId,
                    directory: Directory.Data,
                    recursive: true,
                })
            } catch (error) {
                //console.error('Error deleting card folder:', error)
            }


            emit('updateCard', {
                ...props.card,
                deleted: true
            })
            emit('close')
        } catch (error) {
            console.error('Error deleting card:', error)
            alert(t('cardDetail.failedToDeleteCard'))
        }
    }
}

function hasPhotos(): boolean {
    return !!(photoFront.value || photoBack.value)
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
                            {{ t('cardDetail.addPhotos') }}
                        </button>
                        <button class="menu-item" @click="showShareScreen = true; showMenu = false">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <polyline points="16 6 12 2 8 6" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            {{ t('cardDetail.shareCard') }}
                        </button>
                        <button class="menu-item menu-item-delete" @click="deleteCard(); showMenu = false">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                                    stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                                <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            {{ t('cardDetail.deleteCard') }}
                        </button>
                    </div>
                </div>
            </header>
            <div class="card-content">
                <div v-if="showShareScreen && !showPhotosSection" class="photos-section">
                    <div class="photos-header">
                        <h2>{{ t('cardDetail.shareCard') }}</h2>
                        <button class="close-photos-btn" @click="showShareScreen = false; shareUrl = ''">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="#000" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <div class="share-content">
                        <div v-if="!shareUrl" class="generate-section">
                            <p class="share-description">{{ t('cardDetail.generateShareDescription') }}</p>
                            <button class="generate-btn" @click="generateShareLink">
                                {{ t('cardDetail.generateQRCode') }}
                            </button>
                        </div>
                        <div v-else class="qr-code-container">
                            <div class="qr-code-wrapper">
                                <canvas ref="qrCanvas"></canvas>
                            </div>
                            <p class="qr-code-description">{{ t('cardDetail.scanQRCode') }}</p>
                            <div class="share-link">
                                <input :value="shareUrl" readonly class="share-input" />
                                <button class="copy-btn" @click="copyLink">
                                    {{ t('cardDetail.copyLink') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="showPhotosSection && !showShareScreen" class="photos-section">
                    <div class="photos-header">
                        <h2>{{ t('cardDetail.cardPhotos') }}</h2>
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
                            <h3>{{ t('cardDetail.front') }}</h3>
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
                                <span>{{ t('cardDetail.uploadPhoto') }}</span>
                            </button>
                            <input ref="fileInputFront" type="file" accept="image/*" @change="handlePhotoFrontChange"
                                style="display: none" />
                        </div>
                        <div class="photo-item">
                            <h3>{{ t('cardDetail.back') }}</h3>
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
                                <span>{{ t('cardDetail.uploadPhoto') }}</span>
                            </button>
                            <input ref="fileInputBack" type="file" accept="image/*" @change="handlePhotoBackChange"
                                style="display: none" />
                        </div>
                    </div>
                </div>
                <div v-if="!showPhotosSection && !showShareScreen">
                    <div class="card-display" :style="{ backgroundColor: card.bgColor, color: card.textColor }">
                        <div class="card-logo">
                            <div v-if="card.isCustomCard" class="logo-initials">
                                {{ getInitials(card.name) }}
                            </div>
                            <div v-else class="logo-placeholder">
                                <img :src="'https://cdn.brandfetch.io/' + card.logo + '?c=1idPcHNqxG9p9gPyoFm'" alt=""
                                    style="max-width: 120px; max-height: 100px; object-fit: contain;">
                            </div>
                            <div class="card-brand-name">{{ card.name }}</div>
                        </div>
                    </div>
                    <div class="barcode-section">
                        <div class="barcode">
                            <vue-barcode :value="barcodePattern"
                                :options="{ format: 'CODE128', lineColor: '#000', width: 2, height: 70, displayValue: false }"
                                class="barcode-svg" />
                        </div>
                        <div class="card-number">{{ cardNumber }}</div>
                        <!--<div class="member-number">{{ memberNumber }}</div>-->
                    </div>
                    <div v-if="hasPhotos()" class="photos-gallery-section">
                        <button class="photos-gallery-header" @click="expandPhotos = !expandPhotos">
                            <span class="photos-gallery-title">{{ t('cardDetail.cardPhotos') }}</span>
                            <svg class="expand-icon" :class="{ expanded: expandPhotos }" width="20" height="20"
                                viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </button>
                        <transition name="expand">
                            <div v-if="expandPhotos" class="photos-gallery-content">
                                <div class="photos-grid">
                                    <div v-if="photoFront" class="photo-gallery-item">
                                        <img :src="photoFront" alt="Front" @click="openPhotoModal(photoFront)" />
                                        <span class="photo-label">{{ t('cardDetail.front') }}</span>
                                    </div>
                                    <div v-if="photoBack" class="photo-gallery-item">
                                        <img :src="photoBack" alt="Back" @click="openPhotoModal(photoBack)" />
                                        <span class="photo-label">{{ t('cardDetail.back') }}</span>
                                    </div>
                                </div>
                            </div>
                        </transition>
                    </div>
                    <div v-if="selectedPhotoModal" class="photo-modal-overlay" @click="closePhotoModal()">
                        <div class="photo-modal" @click.stop>
                            <button class="close-modal-btn" @click="closePhotoModal()">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="#fff" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" />
                                </svg>
                            </button>
                            <img :src="selectedPhotoModal" alt="Full size photo" class="modal-photo" />
                        </div>
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
    background-color: var(--bg-primary);
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
    background-color: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
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
    background-color: var(--bg-secondary);
    border-radius: 8px;
    box-shadow: 0 4px 12px var(--shadow-medium);
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
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.2s;
}

.menu-item:hover {
    background-color: var(--border-subtle);
}

.menu-item-delete {
    color: #FF4444 !important;
}

.menu-item-delete:hover {
    background-color: rgba(255, 68, 68, 0.1);
}

.menu-item-delete svg {
    stroke: #FF4444;
}

.detail-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
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
    box-shadow: 0 4px 12px var(--shadow-medium);
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

.barcode-section {
    background-color: var(--bg-secondary);
    border-radius: 16px;
    padding: 30px 20px;
    box-shadow: 0 2px 8px var(--shadow-light);
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
    color: var(--text-primary);
    letter-spacing: 1px;
}

.member-number {
    font-size: 16px;
    color: var(--text-muted);
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
    border-bottom: 2px solid var(--border-color);
}

.photos-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
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

.share-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.generate-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 40px 20px;
}

.share-description {
    font-size: 16px;
    color: var(--text-secondary);
    text-align: center;
    margin: 0;
}

.generate-btn {
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

.generate-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.qr-code-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 20px;
    width: 100%;
}

.qr-code-wrapper {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
}

.qr-code-wrapper canvas {
    display: block;
    border-radius: 8px;
}

.qr-code-description {
    font-size: 16px;
    color: var(--text-secondary);
    text-align: center;
    margin: 0;
}

.share-link {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
}

.share-input {
    width: 100%;
    padding: 12px 16px;
    font-size: 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    text-align: center;
}

.copy-btn {
    padding: 12px 20px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.copy-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.photo-item {
    background-color: var(--bg-secondary);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px var(--shadow-light);
}

.photo-item h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-tertiary);
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
    border: 2px dashed var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-secondary);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 14px;
    color: var(--text-tertiary);
    transition: all 0.2s;
}

.upload-btn:hover {
    border-color: var(--text-muted);
    background-color: var(--border-subtle);
}

.upload-btn:active {
    background-color: var(--border-subtle);
}

.photos-gallery-section {
    background-color: var(--bg-secondary);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px var(--shadow-light);
    margin-bottom: 20px;
}

.photos-gallery-header {
    width: 100%;
    padding: 16px 20px;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary);
    transition: background-color 0.2s;
}

.photos-gallery-header:hover {
    background-color: var(--border-subtle);
}

.photos-gallery-title {
    display: flex;
    align-items: center;
}

.expand-icon {
    transition: transform 0.3s ease;
    color: var(--text-tertiary);
}

.expand-icon.expanded {
    transform: rotate(180deg);
}

.photos-gallery-content {
    padding: 0 20px 20px 20px;
    border-top: 1px solid var(--border-subtle);
}

.photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 15px;
    margin-top: 15px;
}

.photo-gallery-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 1;
    cursor: pointer;
    box-shadow: 0 2px 6px var(--shadow-light);
    transition: transform 0.2s, box-shadow 0.2s;
}

.photo-gallery-item:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px var(--shadow-medium);
}

.photo-gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo-label {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
}

.photo-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.95);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease-out;
}

.photo-modal {
    position: relative;
    width: 90%;
    max-width: 90vh;
    height: auto;
    max-height: 90vh;
}

.close-modal-btn {
    position: absolute;
    top: -50px;
    right: 0;
    width: 40px;
    height: 40px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    z-index: 100;
}

.close-modal-btn:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

.modal-photo {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
}

.expand-enter-active,
.expand-leave-active {
    transition: all 0.3s ease;
    max-height: 500px;
    overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
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
