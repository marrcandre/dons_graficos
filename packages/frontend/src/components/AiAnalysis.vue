<template>
  <v-card rounded="xl" elevation="1" class="pa-6">
    <h2 class="text-h6 font-weight-bold text-primary mb-2">Reflexão sobre seus dons</h2>
    <p class="text-caption text-medium-emphasis mb-4">Análise personalizada gerada por IA</p>

    <!-- Carregando -->
    <div v-if="loading" class="text-center py-6">
      <v-progress-circular indeterminate color="primary" size="40" class="mb-3" />
      <p class="text-body-2 text-medium-emphasis">
        Sua reflexão personalizada está sendo preparada...
      </p>
    </div>

    <!-- Análise disponível -->
    <div
      v-else-if="text"
      class="text-body-1"
      style="line-height: 1.8; white-space: pre-wrap"
    >
      {{ text }}
    </div>

    <!-- Erro -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      rounded="lg"
      class="text-body-2"
    >
      {{ error }}
      <template #append>
        <v-btn
          variant="text"
          color="error"
          :loading="generating"
          @click="generateAnalysis(true)"
        >
          Tentar novamente
        </v-btn>
      </template>
    </v-alert>

    <!-- Sem análise disponível -->
    <v-alert
      v-else
      type="info"
      variant="tonal"
      rounded="lg"
      class="text-body-2"
    >
      A análise personalizada ainda não está disponível.
      Clique em "Gerar agora" para criar sua reflexão personalizada.

      <template #append>
        <v-btn
          variant="text"
          color="info"
          :loading="generating"
          @click="generateAnalysis(true)"
        >
          Gerar agora
        </v-btn>
      </template>
    </v-alert>
  </v-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../services/supabase.js'

const props = defineProps({
  responseId: { type: String, required: true },
  initialText: { type: String, default: null },
})

const text = ref(props.initialText)
const loading = ref(!props.initialText)
const generating = ref(false)
const error = ref(null)

let subscription = null
let pollInterval = null
let pollAttempts = 0

const MAX_POLL_ATTEMPTS = 24 // ~2 minutos a cada 5s

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
    console.error('Erro ao consultar análise IA:', fetchError)
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
    console.error('Erro ao gerar análise IA:', err)

    loading.value = false

    error.value =
      'Não foi possível gerar a análise agora. Tente novamente em instantes.'
  } finally {
    generating.value = false
  }
}

onMounted(() => {
  if (text.value) return

  // Realtime — evento imediato quando ai_analysis é preenchido
  // Requer REPLICA IDENTITY FULL na tabela responses
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

  // Disparar a geração automática da análise de IA (sem forçar se já existir)
  generateAnalysis(false)
})

onUnmounted(() => {
  subscription?.unsubscribe()
  stopPolling()
})
</script>
