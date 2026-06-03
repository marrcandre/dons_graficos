<template>
  <v-container class="py-8" max-width="900">
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold text-primary">Meus resultados</h1>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        prepend-icon="mdi-play-circle"
        to="/quiz"
      >
        Novo teste
      </v-btn>
    </div>

    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      rounded="xl"
      class="mb-4"
    >
      {{ error }}
      <template #append>
        <v-btn variant="text" color="error" @click="loadResults">Tentar novamente</v-btn>
      </template>
    </v-alert>

    <v-card v-else-if="rows.length === 0" rounded="xl" elevation="1" class="pa-8 text-center">
      <v-icon size="56" color="grey-lighten-1" class="mb-4">mdi-clipboard-text-outline</v-icon>
      <p class="text-body-1 text-medium-emphasis mb-4">Você ainda não fez nenhum teste.</p>
      <v-btn color="primary" variant="flat" rounded="lg" prepend-icon="mdi-play-circle" to="/quiz">
        Fazer o primeiro teste
      </v-btn>
    </v-card>

    <v-card v-else rounded="xl" elevation="1">
      <v-list lines="two">
        <template v-for="(item, i) in rows" :key="item.id">
          <v-divider v-if="i > 0" />
          <v-list-item
            :to="{ name: 'results', params: { id: item.id } }"
            rounded="0"
            class="py-3"
          >
            <template #prepend>
              <v-avatar color="primary" variant="tonal" size="42" class="mr-2">
                <v-icon>mdi-gift-outline</v-icon>
              </v-avatar>
            </template>

            <template #title>
              <span class="font-weight-semibold">{{ topGift(item.scores) }}</span>
            </template>

            <template #subtitle>
              {{ formatDate(item.created_at) }}
              <span v-if="item.gp" class="ml-2 text-medium-emphasis">· GP {{ item.gp }}</span>
            </template>

            <template #append>
              <div class="d-flex flex-column align-end gap-1 mr-2">
                <v-chip
                  :color="item.ai_analysis ? 'success' : 'warning'"
                  size="x-small"
                  variant="tonal"
                >
                  {{ item.ai_analysis ? 'Análise pronta' : 'Análise pendente' }}
                </v-chip>
                <v-chip
                  :color="item.email_sent ? 'success' : 'grey'"
                  size="x-small"
                  variant="tonal"
                >
                  {{ item.email_sent ? 'Email enviado' : 'Email pendente' }}
                </v-chip>
              </div>
              <v-icon icon="mdi-chevron-right" color="grey" />
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../services/supabase.js'
import { runSupabaseQuery } from '../services/supabaseQuery.js'
import { useAuthStore } from '../stores/auth.js'
import { rankGifts } from '../services/scoring.js'

const authStore = useAuthStore()
const loading = ref(true)
const error = ref(null)
const rows = ref([])

onMounted(loadResults)

async function loadResults() {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await runSupabaseQuery(
      supabase
        .from('responses')
        .select('id, created_at, gp, scores, ai_analysis, email_sent')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })
    )

    if (fetchError) throw fetchError
    rows.value = data ?? []
  } catch (err) {
    console.error('Erro ao carregar resultados:', err)
    error.value = 'Não foi possível carregar seus resultados. Tente novamente.'
  } finally {
    loading.value = false
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function topGift(scores) {
  if (!scores) return '—'
  return rankGifts(scores)[0]?.gift.name ?? '—'
}
</script>
