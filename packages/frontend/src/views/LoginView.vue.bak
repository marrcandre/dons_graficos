<template>
  <v-container class="fill-height d-flex align-center justify-center"
    style="min-height: 100vh; background: linear-gradient(160deg, #1B5438 0%, #2d7a50 100%);">
    <v-card max-width="440" width="100%" rounded="xl" elevation="8" class="pa-6">
      <div class="text-center mb-6">
        <v-icon size="56" color="primary" class="mb-2">mdi-gift</v-icon>
        <h1 class="text-h5 font-weight-bold text-primary">Descubra Seus Dons Espirituais</h1>
        <p class="text-body-2 text-medium-emphasis mt-2">
          Teste baseado no modelo de C. Peter Wagner
        </p>
      </div>

      <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
        {{ error }}
      </v-alert>

      <v-btn color="primary" size="large" block rounded="lg" :loading="loading" prepend-icon="mdi-google"
        @click="handleLogin">
        Entrar com Google
      </v-btn>

      <p class="text-caption text-center text-medium-emphasis mt-4">
        Seus dados são usados somente para identificação do seu resultado.
      </p>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref(null)

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    await authStore.signInWithGoogle()
  } catch (err) {
    error.value = 'Não foi possível entrar. Tente novamente.'
    loading.value = false
  }
}
</script>
