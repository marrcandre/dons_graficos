<template>
  <v-app>
    <AppHeader v-if="authStore.user" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import { useAuthStore } from './stores/auth.js'

const authStore = useAuthStore()
</script>
