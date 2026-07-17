import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { isAuthenticated } from '@/utils/axiosHelper'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true }
    }
  ]
})

router.beforeEach((to) => {
  const authenticated = isAuthenticated()

  if (to.meta.requiresAuth && !authenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authenticated) {
    return { name: 'home' }
  }
})

export default router
