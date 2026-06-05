<template>
  <v-card rounded="xl" color="primary" variant="tonal" class="pa-6">
    <h2 class="text-h6 font-weight-bold text-primary mb-4">
      <v-icon icon="mdi-shield-account" class="mr-2" />
      Ações do Admin
    </h2>

    <!-- Editar análise IA -->
    <v-textarea
      v-model="aiText"
      label="Análise IA (editável)"
      variant="outlined"
      rounded="lg"
      rows="8"
      class="mb-3"
      bg-color="white"
    />
    <v-btn
      variant="outlined"
      color="primary"
      prepend-icon="mdi-content-save"
      class="mb-4"
      :loading="savingAi"
      @click="saveAiAnalysis"
    >
      Salvar análise
    </v-btn>

    <!-- Regenerar IA -->
    <v-btn
      variant="text"
      color="grey"
      prepend-icon="mdi-refresh"
      class="mb-6 ml-2"
      :loading="regenerating"
      @click="regenerateAi"
    >
      Regenerar IA
    </v-btn>

    <v-divider class="mb-4" />

    <!-- Aprovar e enviar email -->
    <v-btn
      color="primary"
      block
      size="large"
      rounded="lg"
      prepend-icon="mdi-email-send"
      :loading="sendingEmail"
      :disabled="!!props.response.email_sent"
      @click="sendEmail"
    >
      {{ props.response.email_sent ? 'Email já enviado ✓' : 'Aprovar e Enviar Email' }}
    </v-btn>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../services/supabase.js'

const props = defineProps({
  response: { type: Object, required: true },
})
const emit = defineEmits(['updated'])

const aiText = ref(props.response.ai_analysis ?? '')
const savingAi = ref(false)
const regenerating = ref(false)
const sendingEmail = ref(false)

const snackbar = ref({ show: false, text: '', color: 'success' })

watch(
  () => props.response.ai_analysis,
  (value) => {
    aiText.value = value ?? ''
  }
)

function notify(text, color = 'success') {
  snackbar.value = { show: true, text, color }
}

async function saveAiAnalysis() {
  savingAi.value = true
  try {
    const { error } = await supabase
      .from('responses')
      .update({ ai_analysis: aiText.value })
      .eq('id', props.response.id)
    if (error) throw error
    notify('Análise salva com sucesso.')
    emit('updated')
  } catch {
    notify('Erro ao salvar análise.', 'error')
  } finally {
    savingAi.value = false
  }
}

async function regenerateAi() {
  regenerating.value = true
  try {
    const { error } = await supabase.functions.invoke('generate-ai', {
      body: { responseId: props.response.id, force: true },
    })
    if (error) throw error
    notify('Regeneração iniciada. Aguarde alguns segundos.')
    emit('updated')
  } catch (err) {
    console.error('Erro ao regenerar análise:', err)
    notify('Erro ao regenerar análise.', 'error')
  } finally {
    regenerating.value = false
  }
}

async function sendEmail() {
  sendingEmail.value = true
  try {
    const { error } = await supabase.functions.invoke('notify-admin', {
      body: { responseId: props.response.id },
    })
    if (error) throw error
    notify('Email enviado com sucesso!')
    emit('updated')
  } catch (err) {
    console.error('Erro ao enviar email:', err)
    notify('Erro ao enviar email.', 'error')
  } finally {
    sendingEmail.value = false
  }
}
</script>
