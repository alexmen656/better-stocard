import { ref, watch, onMounted } from 'vue'
import { Preferences } from '@capacitor/preferences'

const isDarkMode = ref(false)

export const useDarkMode = () => {
  const initDarkMode = async () => {
    // Check for saved preference
    const { value } = await Preferences.get({ key: 'darkMode' })

    if (value !== null) {
      isDarkMode.value = value === 'true'
    } else {
      // Check system preference
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    applyDarkMode(isDarkMode.value)
  }

  const toggleDarkMode = async () => {
    isDarkMode.value = !isDarkMode.value
    await Preferences.set({
      key: 'darkMode',
      value: String(isDarkMode.value),
    })
    applyDarkMode(isDarkMode.value)
  }

  const applyDarkMode = (isDark: boolean) => {
    const htmlElement = document.documentElement
    if (isDark) {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }

  // Watch for system theme changes
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('darkMode')) {
        isDarkMode.value = e.matches
        applyDarkMode(e.matches)
      }
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    }
  })

  return {
    isDarkMode,
    toggleDarkMode,
    initDarkMode,
  }
}
