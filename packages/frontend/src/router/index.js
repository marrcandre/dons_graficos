import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: () => import('../views/QuizView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/meus-resultados',
    name: 'my-results',
    component: () => import('../views/MyResultsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/results/:id',
    name: 'results',
    component: () => import('../views/ResultsView.vue'),
    meta: { public: true }, // público por link; UUID é a segurança
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  const needsAuthState = to.meta.requiresAuth || to.meta.requiresAdmin || to.name === 'login'

  // Rotas públicas, como /results/:id, não devem ficar bloqueadas pelo Auth.
  if (!authStore.initialized && !needsAuthState) {
    authStore.init().catch((err) => console.error('Erro ao inicializar autenticação:', err))
  }

  if (!authStore.initialized && needsAuthState) {
    await authStore.init()
  }

  if (to.meta.requiresAdmin) {
    if (!authStore.user) return { name: 'login' }
    if (!authStore.isAdmin) return { name: 'home' }
  }

  if (to.meta.requiresAuth && !authStore.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'login' && authStore.user) {
    return { name: 'home' }
  }
})

export default router
