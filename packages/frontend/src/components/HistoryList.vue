<template>
  <v-card rounded="xl" elevation="1" class="pa-6">
    <h2 class="text-h6 font-weight-bold text-primary mb-4">Seus testes anteriores</h2>

    <div v-if="loading" class="text-center py-4">
      <v-progress-circular indeterminate color="primary" size="32" />
    </div>

    <v-list v-else-if="history.length" lines="two">
      <v-list-item
        v-for="item in history"
        :key="item.id"
        :to="{ name: 'results', params: { id: item.id } }"
        :class="item.id === currentId ? 'bg-primary-lighten-5' : ''"
        rounded="lg"
        class="mb-1"
      >
        <template #title>
          <span class="font-weight-medium">{{ formatDate(item.created_at) }}</span>
          <v-chip v-if="item.id === currentId" size="x-small" color="primary" class="ml-2">atual</v-chip>
        </template>
        <template #subtitle>
          {{ topGift(item.scores) }}
        </template>
        <template #append>
          <v-icon icon="mdi-chevron-right" color="grey" />
        </template>
      </v-list-item>
    </v-list>

    <p v-else class="text-body-2 text-medium-emphasis">Nenhum teste anterior.</p>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../services/supabase.js'
import { useAuthStore } from '../stores/auth.js'
import { rankGifts } from '../services/scoring.js'

const props = defineProps({
  currentId: { type: String, required: true },
})

const authStore = useAuthStore()
const loading = ref(true)
const history = ref([])

onMounted(async () => {
  const { data } = await supabase
    .from('responses')
    .select('id, created_at, scores')
    .eq('user_id', authStore.user.id)
    .order('created_at', { ascending: false })
    .limit(10)
  history.value = data ?? []
  loading.value = false
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function topGift(scores) {
  if (!scores) return ''
  const ranked = rankGifts(scores)
  return `Dom principal: ${ranked[0]?.gift.name}`
}
</script>
