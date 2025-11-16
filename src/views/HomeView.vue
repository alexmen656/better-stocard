<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CardDetail from '@/components/CardDetail.vue'
import { Preferences } from '@capacitor/preferences';

interface Card {
  id: number
  name: string
  logo: string
  bgColor: string
  textColor: string
}

const cards = ref<Card[]>([]);
/*const cards = ref<Card[]>([
  { id: 1, name: 'COOP', bgColor: '#E53935', textColor: '#FFFFFF' },
  { id: 2, name: 'ESSELUNGA', bgColor: '#1565C0', textColor: '#FFFFFF' },
  { id: 3, name: 'Carrefour', bgColor: '#0D47A1', textColor: '#FFFFFF' },
  { id: 4, name: '🌼CONAD', bgColor: '#E53935', textColor: '#FFFFFF' },
  { id: 5, name: 'Media•World', bgColor: '#C62828', textColor: '#FFFFFF' },
  { id: 6, name: 'IKEA FAMILY', bgColor: '#FF9800', textColor: '#FFFFFF' },
  { id: 7, name: 'DECATHLON', bgColor: '#42A5F5', textColor: '#FFFFFF' },
  { id: 8, name: 'TIGOTA', bgColor: '#26A69A', textColor: '#FFFFFF' },
  { id: 9, name: 'OVS', bgColor: '#212121', textColor: '#FFFFFF' },
  { id: 10, name: 'TUFI', bgColor: '#F5F5F5', textColor: '#E91E63' },
  { id: 11, name: 'Lidl', bgColor: '#F5F5F5', textColor: '#E91E63' },
])*/

const selectedCard = ref<Card | null>(null)

function openCard(card: Card) {
  selectedCard.value = card
}

function closeCard() {
  selectedCard.value = null
}

const getCards = async () => {
  const { value } = await Preferences.get({ key: 'cards' });
  const cards = JSON.parse(value)
  return cards;
};

const setCards = async () => {
  const cards2 = ref<Card[]>([
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
  ]);

  await Preferences.set({
    key: 'cards',
    value: JSON.stringify(cards2.value),
  });
};

onMounted(async () => {
  //await setCards();
  cards.value = await getCards();
});
</script>

<template>
  <div class="app-container">
    <header class="header">
      <h1 class="title">Cards</h1>
      <button class="add-button" @click="$router.push('/create-card')">+</button>
    </header>
    <div class="section-title">ALL CARDS</div>
    <div class="cards-grid">
      <div v-for="card in cards" :key="card.id" class="card"
        :style="{ backgroundColor: card.bgColor, color: card.textColor }" @click="openCard(card)">
        <div class="card-name"><!--{{ card.name }}-->
          <!--<img
            :src="'https://cdn.brandfetch.io/' + card.name.toLowerCase().replace(/\s+/g, '-').replace('•', '') + '.com?c=1idPcHNqxG9p9gPyoFm'"
            alt="" style="max-width: 200px; max-height: 100px; object-fit: contain;">-->
          <img :src="'https://cdn.brandfetch.io/' + card.logo + '?c=1idPcHNqxG9p9gPyoFm'" alt=""
            style="max-width: 200px; max-height: 100px; object-fit: contain;">
        </div>
      </div>
    </div>
    <!--
    <h2>Testing Brandfetch</h2>
    <img src="https://cdn.brandfetch.io/apple.com?c=1idPcHNqxG9p9gPyoFm" alt="Logo by Brandfetch" />
    <img src="https://cdn.brandfetch.io/decathlon.com?c=1idPcHNqxG9p9gPyoFm" alt="Logo by Brandfetch" />
    <img src="https://cdn.brandfetch.io/ikea.com?c=1idPcHNqxG9p9gPyoFm" alt="Logo by Brandfetch" />
    -->

    <CardDetail v-if="selectedCard" :card="selectedCard" @close="closeCard" />
    <nav class="bottom-nav">
      <button class="nav-item active">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="5" rx="1" fill="#FF6B6B" />
          <rect x="3" y="10" width="7" height="5" rx="1" fill="#FF6B6B" />
          <rect x="3" y="17" width="7" height="5" rx="1" fill="#FF6B6B" />
          <rect x="12" y="3" width="9" height="2" rx="1" fill="#FF6B6B" />
          <rect x="12" y="10" width="9" height="2" rx="1" fill="#FF6B6B" />
          <rect x="12" y="17" width="9" height="2" rx="1" fill="#FF6B6B" />
        </svg>
        <span>Cards</span>
      </button>
      <button class="nav-item" @click="$router.push('/settings')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7V17C2 20.31 7.03 23.25 12 24C16.97 23.25 22 20.31 22 17V7L12 2Z" stroke="#999"
            stroke-width="2" fill="none" />
        </svg>
        <span>Settings</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 70px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px 20px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E0E0E0;
}

.title {
  font-size: 20px;
  font-weight: 400;
  color: #999999;
  letter-spacing: 0.5px;
}

.add-button {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: #FF6B6B;
  font-size: 32px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
  gap: 8px;
  padding: 0 20px;
}

.card {
  aspect-ratio: 1.5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card:active {
  transform: scale(0.98);
}

.card-name {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  padding: 20px;
  letter-spacing: 1px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  border-top: 1px solid #E0E0E0;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 24px;
  color: #999999;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav-item.active {
  color: #FF6B6B;
}

.nav-item svg {
  width: 24px;
  height: 24px;
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
