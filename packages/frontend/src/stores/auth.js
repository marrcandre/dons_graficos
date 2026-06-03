import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../services/supabase.js'
import { runSupabaseQuery } from '../services/supabaseQuery.js'

const AUTH_TIMEOUT_MS = 8000

function withTimeout(promise, timeoutMs, message) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs)
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const initialized = ref(false)
  let initPromise = null
  let authSubscription = null

  const isAdmin = computed(() => profile.value?.role === 'admin')

  async function init() {
    if (initialized.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          'Timeout ao carregar sessão'
        )
        user.value = session?.user ?? null
        if (session?.user) {
          await loadProfile(session.user.id)
        }

        if (!authSubscription) {
          const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            user.value = session?.user ?? null
            if (session?.user) {
              loadProfile(session.user.id).catch((err) => {
                console.error('Erro ao carregar perfil:', err)
              })
            } else {
              profile.value = null
            }
          })
          authSubscription = data.subscription
        }
      } catch (err) {
        console.error('Erro ao inicializar autenticação:', err)
        user.value = null
        profile.value = null
      } finally {
        initialized.value = true
        initPromise = null
      }
    })()

    return initPromise
  }

  async function loadProfile(userId) {
    const { data, error } = await runSupabaseQuery(
      supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single(),
      AUTH_TIMEOUT_MS
    )
    if (error) throw error
    profile.value = data
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return { user, profile, isAdmin, initialized, init, signInWithGoogle, signOut }
})
