<script setup lang="ts">
import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences'
import TouchBar from '@/components/TouchBar.vue'
import SettingsHeader from '@/components/SettingsHeader.vue'

const APP_VERSION = '1.0.0'
const APP_BUILD = '1'
const GITHUB_URL = 'https://github.com/alexmen656/better-stocard'

const buildClickCount = ref(0)
const buildClickTimer = ref<number | null>(null)
const showDebugMenu = ref(false)

const handleBuildClick = () => {
  buildClickCount.value++

  if (buildClickTimer.value) {
    clearTimeout(buildClickTimer.value)
  }

  if (buildClickCount.value === 5) {
    showDebugMenu.value = true
    buildClickCount.value = 0
    return
  }

  buildClickTimer.value = window.setTimeout(() => {
    buildClickCount.value = 0
  }, 500)
}

const addDemoData = async () => {
  const demoCards = [
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
  ]

  await Preferences.set({
    key: 'cards',
    value: JSON.stringify(demoCards),
  })

  showDebugMenu.value = false
  alert('Demo-Daten hinzugefügt!')
}
</script>

<template>
  <div class="settings-container">
    <SettingsHeader />
    <div class="settings-content">
      <h2 class="section-title">INFORMATION</h2>
      <div class="settings-section">
        <div class="settings-item">
          <div class="item-label">App Version</div>
          <div class="item-value">{{ APP_VERSION }}</div>
        </div>
        <div class="settings-item">
          <div class="item-label">App Build</div>
          <div class="item-value clickable" @click="handleBuildClick">
            {{ APP_BUILD }}
          </div>
        </div>
      </div>
      <h2 class="section-title">OPEN SOURCE</h2>
      <div class="settings-section">
        <div class="open-source-info">
          <p class="info-text">This App is Open Source</p>
          <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" class="github-link">
            <span class="github-icon">GitHub</span>
            <span class="link-text">View on GitHub</span>
          </a>
        </div>
      </div>
      <div v-if="showDebugMenu" class="debug-menu">
        <div class="debug-overlay" @click="showDebugMenu = false"></div>
        <div class="debug-content">
          <h3>Debug Menu</h3>
          <button class="debug-button" @click="addDemoData">Add Demo Data</button>
          <button class="debug-button secondary" @click="showDebugMenu = false">Close</button>
        </div>
      </div>
    </div>
    <TouchBar />
  </div>
</template>

<style scoped>
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.settings-container {
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

.settings-content {
  padding: 0px 20px 10px 20px;
}

.section-title {
  padding: 20px 4px 12px 4px;
  font-size: 12px;
  font-weight: 600;
  color: #999999;
  letter-spacing: 0.5px;
  margin: 0;
  background-color: transparent;
}

.settings-section {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.settings-item {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.settings-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
}

.item-value {
  font-size: 16px;
  color: #666666;
  font-weight: 400;
}

.item-value.clickable {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.item-value.clickable:active {
  background-color: #e0e0e0;
}

.open-source-info {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-text {
  margin: 0;
  font-size: 16px;
  color: #333333;
  font-weight: 500;
}

.github-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: #333333;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: background-color 0.2s;
  -webkit-user-select: none;
  user-select: none;
}

.github-link:active {
  background-color: #1a1a1a;
}

.github-icon {
  font-weight: 700;
  font-size: 16px;
}

.link-text {
  flex: 1;
  text-align: left;
}

/* Debug Menu Styles */
.debug-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.debug-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.debug-content {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 300px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.debug-content h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.debug-button {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background-color: #007AFF;
  color: white;
  transition: background-color 0.2s;
  -webkit-user-select: none;
  user-select: none;
}

.debug-button:active {
  background-color: #0051D5;
}

.debug-button.secondary {
  background-color: #e0e0e0;
  color: #333333;
}

.debug-button.secondary:active {
  background-color: #d0d0d0;
}

@media (min-width: 1024px) {
  .settings-container {
    display: flex;
    flex-direction: column;
  }

  .settings-content {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    padding-left: 20px;
    padding-right: 20px;
  }

  .settings-section {
    margin-bottom: 24px;
  }
}
</style>