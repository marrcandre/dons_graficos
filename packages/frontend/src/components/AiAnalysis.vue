<template>
  <v-card rounded="xl" elevation="1" class="pa-6">

    <div class="d-flex align-center justify-space-between mb-4">

      <div>
        <h2 class="text-subtitle-1 font-weight-bold text-primary mb-0">
          Análise dos seus dons
        </h2>
      </div>

      <v-tooltip v-if="authStore.isAdmin" text="Atualizar análise">
        <template #activator="{ props }">
          <v-btn icon="mdi-refresh" variant="text" color="primary" v-bind="props" :loading="generating"
            @click="generateAnalysis(true)" />
        </template>
      </v-tooltip>

    </div>

    <!-- Carregando -->
    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary" size="40" class="mb-3" />

      <p class="text-body-2 text-medium-emphasis">
        Preparando a análise...
      </p>
    </div>

    <!-- Análise disponível -->
    <div v-else-if="text" class="text-body-2" style="line-height: 1.9; white-space: pre-wrap">
      {{ text }}
    </div>

    <!-- Erro -->
    <v-alert v-else-if="error" type="error" variant="tonal" rounded="lg" class="text-body-2">
      Não foi possível carregar a análise neste momento.
    </v-alert>

    <!-- Sem análise -->
    <v-alert v-else type="info" variant="tonal" rounded="lg" class="text-body-2">
      A análise ainda está sendo preparada.

      <br /><br />

      Esta página será atualizada automaticamente assim que a análise estiver pronta.
    </v-alert>

  </v-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../services/supabase.js'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps({
  responseId: { type: String, required: true },
  initialText: { type: String, default: null },
})

const authStore = useAuthStore()

const text = ref(props.initialText)
const loading = ref(!props.initialText)
const generating = ref(false)
const error = ref(null)

let subscription = null
let pollInterval = null
let pollAttempts = 0

const MAX_POLL_ATTEMPTS = 24 // ~2 minutos

function stopPolling() {
  clearInterval(pollInterval)
  pollInterval = null
}

function startPolling() {
  stopPolling()
  pollAttempts = 0
  pollForAnalysis()
  pollInterval = setInterval(pollForAnalysis, 5000)
}

async function pollForAnalysis() {
  pollAttempts++

  const { data, error: fetchError } = await supabase
    .from('responses')
    .select('ai_analysis')
    .eq('id', props.responseId)
    .single()

  if (fetchError) {
    console.error('Erro ao consultar análise:', fetchError)
  }

  if (data?.ai_analysis) {
    text.value = data.ai_analysis
    loading.value = false
    error.value = null

    stopPolling()
    subscription?.unsubscribe()
  } else if (pollAttempts >= MAX_POLL_ATTEMPTS) {
    loading.value = false
    stopPolling()
  }
}

async function generateAnalysis(force = false) {
  generating.value = true
  loading.value = true
  error.value = null

  try {
    const { error: invokeError } = await supabase.functions.invoke(
      'generate-ai',
      {
        body: {
          responseId: props.responseId,
          force,
        },
      }
    )

    if (invokeError) {
      throw invokeError
    }

    startPolling()
  } catch (err) {
    console.error('Erro ao gerar análise:', err)

    loading.value = false

    error.value =
      'Não foi possível gerar a análise agora. Tente novamente em instantes.'
  } finally {
    generating.value = false
  }
}

onMounted(() => {
  if (text.value) return

  subscription = supabase
    .channel(`response-ai-${props.responseId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'responses',
        filter: `id=eq.${props.responseId}`,
      },
      (payload) => {
        if (payload.new?.ai_analysis) {
          text.value = payload.new.ai_analysis
          loading.value = false
          error.value = null

          stopPolling()
        }
      }
    )
    .subscribe()

  generateAnalysis(false)
})

onUnmounted(() => {
  subscription?.unsubscribe()
  stopPolling()
})
</script>
