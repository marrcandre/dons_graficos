<template>
  <v-app-bar color="primary" elevation="2">
    <v-app-bar-title>
      <span class="font-weight-bold text-white">Dons Espirituais</span>
    </v-app-bar-title>

    <template #append>
      <v-btn
        v-if="authStore.isAdmin"
        icon="mdi-shield-account"
        color="white"
        variant="text"
        to="/admin"
        title="Painel Admin"
      />
      <v-btn
        icon="mdi-home"
        color="white"
        variant="text"
        to="/"
        title="Início"
      />
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props" variant="text">
            <v-avatar size="32" :image="authStore.user?.user_metadata?.avatar_url" color="secondary">
              <span v-if="!authStore.user?.user_metadata?.avatar_url" class="text-caption font-weight-bold">
                {{ initials }}
              </span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :subtitle="authStore.user?.email">
            <template #title>
              <span class="font-weight-medium">{{ authStore.user?.user_metadata?.full_name }}</span>
            </template>
          </v-list-item>
          <v-divider />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Sair"
            @click="authStore.signOut()"
          />
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const authStore = useAuthStore()

const initials = computed(() => {
  const name = authStore.user?.user_metadata?.full_name || ''
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
})
</script>
