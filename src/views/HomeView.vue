<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CardDetail from '@/components/CardDetail.vue'
import { Preferences } from '@capacitor/preferences';
import TouchBar from '@/components/TouchBar.vue'
import CardsHeader from '@/components/CardsHeader.vue'

interface Card {
  id: number
  name: string
  logo: string
  bgColor: string
  textColor: string
  isCustomCard?: boolean
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

const cards = ref<Card[]>([]);
const selectedCard = ref<Card | null>(null)

function openCard(card: Card) {
  selectedCard.value = card
}

function closeCard() {
  selectedCard.value = null
}

function updateCard(updatedCard: Card) {
  const cardIndex = cards.value.findIndex(c => c.id === updatedCard.id)
  if (cardIndex !== -1) {
    cards.value[cardIndex] = updatedCard
    saveCards()
  }
}

async function saveCards() {
  await Preferences.set({
    key: 'cards',
    value: JSON.stringify(cards.value),
  });
}

const getCards = async (): Promise<Card[]> => {
  const { value } = await Preferences.get({ key: 'cards' });
  if (!value) return []
  const cardsData = JSON.parse(value)

  for (const card of cardsData) {
    if (!card.isCustomCard && card.logo) {
      const logoUrl = `https://cdn.brandfetch.io/${card.logo}?c=1idPcHNqxG9p9gPyoFm`
      const bgColor = await extractColorFromImage(logoUrl)
      card.bgColor = bgColor
      card.textColor = getTextColor(bgColor)
    }
  }

  return cardsData;
};

onMounted(async () => {
  cards.value = await getCards();
});
</script>

<template>
  <div class="app-container">
    <CardsHeader />
    <div class="section-title">ALL CARDS</div>
    <div class="cards-grid">
      <div v-for="card in cards" :key="card.id" class="card"
        :style="{ backgroundColor: card.bgColor, color: card.textColor }" @click="openCard(card)">
        <div class="card-name">
          <div v-if="card.isCustomCard" class="card-initials">
            {{ getInitials(card.name) }}
          </div>
          <img v-else :src="'https://cdn.brandfetch.io/' + card.logo + '?c=1idPcHNqxG9p9gPyoFm'" alt=""
            style="max-width: 200px; max-height: 100px; object-fit: contain;">
        </div>
      </div>
    </div>
    <CardDetail v-if="selectedCard" :card="selectedCard" @close="closeCard" @updateCard="updateCard" />
    <TouchBar />
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.app-container {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 70px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-user-select: none;
  user-select: none;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.section-title {
  padding: 15px 20px 10px 20px;
  font-size: 12px;
  font-weight: 500;
  color: #999999;
  letter-spacing: 0.5px;
  background-color: #F5F5F5;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
  width: 100%;
  box-sizing: border-box;
}

.card {
  aspect-ratio: 1.4;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 0;
}

.card:active {
  transform: scale(0.98);
}

.card-name {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  padding: 16px;
  letter-spacing: 1px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-initials {
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 800px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1200px;
  }
}
</style>