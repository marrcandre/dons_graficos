<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  await auth.init()
  router.replace('/')
})
</script>

<template>
  <div class="d-flex justify-center align-center" style="height: 100vh;">
    Carregando login...
  </div>
</template>