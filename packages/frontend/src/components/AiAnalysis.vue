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
    <div v-else-if="text" class="text-body-1" style="line-height: 1.8; white-space: pre-wrap">
      {{ text }}
    </div>

    <!-- Sem análise (erro ou não disponível) -->
    <v-alert
      v-else
      type="info"
      variant="tonal"
      rounded="lg"
      class="text-body-2"
    >
      A análise personalizada será disponibilizada em breve. Você receberá um email quando estiver pronta.
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

let subscription = null
let pollInterval = null
let pollAttempts = 0
const MAX_POLL_ATTEMPTS = 24 // ~2 minutos a cada 5s

async function pollForAnalysis() {
  pollAttempts++
  const { data } = await supabase
    .from('responses')
    .select('ai_analysis')
    .eq('id', props.responseId)
    .single()

  if (data?.ai_analysis) {
    text.value = data.ai_analysis
    loading.value = false
    clearInterval(pollInterval)
    subscription?.unsubscribe()
  } else if (pollAttempts >= MAX_POLL_ATTEMPTS) {
    loading.value = false // exibe mensagem de "em breve"
    clearInterval(pollInterval)
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
          clearInterval(pollInterval)
        }
      }
    )
    .subscribe()

  // Polling de fallback a cada 5s (cobre casos onde Realtime falha
  // ou REPLICA IDENTITY FULL ainda não foi aplicado)
  pollForAnalysis() // checar imediatamente (função pode já ter terminado)
  pollInterval = setInterval(pollForAnalysis, 5000)
})

onUnmounted(() => {
  subscription?.unsubscribe()
  clearInterval(pollInterval)
})
</script>
