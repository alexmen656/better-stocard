import { App as CapacitorApp, URLOpenListenerEvent } from '@capacitor/app'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/create-card',
      name: 'create-card',
      component: () => import('../views/CreateCardView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/share/card/:id',
      component: () => import('../views/CardImportView.vue'),
    },
  ],
})

CapacitorApp.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
  console.log('App opened with URL:', event.url)

  const slug = event.url.split('.com').pop()

  if (slug) {
    router.push(slug)
  }
})
export default router
