<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Preferences } from '@capacitor/preferences'
import TouchBar from '@/components/TouchBar.vue'
import SettingsHeader from '@/components/SettingsHeader.vue'
import { useDarkMode } from '@/composables/useDarkMode'
import { useI18n } from 'vue-i18n'

const { isDarkMode, toggleDarkMode } = useDarkMode()
const { t, locale } = useI18n()

const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'cz', name: 'Čeština' },
]

const currentLanguage = ref(locale.value)

const changeLanguage = async (langCode: string) => {
  locale.value = langCode
  currentLanguage.value = langCode
  localStorage.setItem('app-locale', langCode)
}

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
  alert(t('settings.demoDataAdded'))
}
</script>

<template>
  <div class="settings-container">
    <SettingsHeader />
    <div class="settings-content">
      <h2 class="section-title">{{ t('settings.appearance') }}</h2>
      <div class="settings-section">
        <div class="settings-item">
          <div class="item-label">{{ t('settings.darkMode') }}</div>
          <div class="toggle-switch" :class="{ active: isDarkMode }" @click="toggleDarkMode">
            <div class="toggle-circle"></div>
          </div>
        </div>
        <div class="settings-item">
          <div class="item-label">Language</div>
          <select v-model="currentLanguage" @change="changeLanguage(currentLanguage)" class="language-select">
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>
      <h2 class="section-title">{{ t('settings.information') }}</h2>
      <div class="settings-section">
        <div class="settings-item">
          <div class="item-label">{{ t('settings.appVersion') }}</div>
          <div class="item-value">{{ APP_VERSION }}</div>
        </div>
        <div class="settings-item">
          <div class="item-label">{{ t('settings.appBuild') }}</div>
          <div class="item-value clickable" @click="handleBuildClick">
            {{ APP_BUILD }}
          </div>
        </div>
      </div>
      <h2 class="section-title">{{ t('settings.openSource') }}</h2>
      <div class="settings-section">
        <div class="open-source-info">
          <p class="info-text">{{ t('settings.openSourceInfo') }}</p>
          <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" class="github-link">
            <span class="github-icon">GitHub</span>
            <span class="link-text">{{ t('settings.viewOnGithub') }}</span>
          </a>
        </div>
      </div>
      <div v-if="showDebugMenu" class="debug-menu">
        <div class="debug-overlay" @click="showDebugMenu = false"></div>
        <div class="debug-content">
          <h3>{{ t('settings.debugMenu') }}</h3>
          <button class="debug-button" @click="addDemoData">{{ t('settings.addDemoData') }}</button>
          <button class="debug-button secondary" @click="showDebugMenu = false">{{ t('settings.close') }}</button>
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
  background-color: var(--bg-primary);
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
  color: var(--text-muted);
  letter-spacing: 0.5px;
  margin: 0;
  background-color: transparent;
}

.settings-section {
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-light);
  margin-bottom: 20px;
}

.settings-item {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
}

.settings-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
}

.item-value {
  font-size: 16px;
  color: var(--text-tertiary);
  font-weight: 400;
}

.item-value.clickable {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.item-value.clickable:active {
  background-color: var(--border-subtle);
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
  color: var(--text-secondary);
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

.language-select {
  padding: 6px 12px;
  font-size: 16px;
  color: var(--text-tertiary);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 400;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 30px;
}

.language-select:focus {
  outline: none;
  border-color: #007AFF;
}

.toggle-switch {
  width: 51px;
  height: 31px;
  background-color: #ccc;
  border-radius: 16px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  padding: 0 2px;
}

.toggle-switch.active {
  background-color: #34C759;
}

.toggle-circle {
  width: 27px;
  height: 27px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s;
  position: absolute;
  left: 2px;
}

.toggle-switch.active .toggle-circle {
  transform: translateX(20px);
}

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
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  max-width: 300px;
  width: 90%;
  box-shadow: 0 10px 40px var(--shadow-dark);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.debug-content h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
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
  background-color: var(--border-color);
  color: var(--text-secondary);
}

.debug-button.secondary:active {
  background-color: var(--border-subtle);
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