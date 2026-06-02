<template>
  <v-container class="py-8" max-width="700">
    <!-- Hero -->
    <div class="text-center mb-8">
      <v-icon size="64" color="primary" class="mb-3">mdi-star-circle-outline</v-icon>
      <h1 class="text-h4 font-weight-bold text-primary mb-3">
        Descubra Seus Dons Espirituais
      </h1>
      <p class="text-body-1 text-medium-emphasis">
        Olá, <strong>{{ authStore.profile?.name || authStore.user?.user_metadata?.full_name }}</strong>!
        Que bom ter você aqui.
      </p>
    </div>

    <!-- Intro text -->
    <v-card rounded="xl" variant="tonal" color="primary" class="mb-6 pa-6">
      <p class="text-body-1 mb-3">
        <strong>Você já se perguntou quais são os seus dons espirituais?</strong>
        Cada crente recebe dons do Espírito Santo para edificar o corpo de Cristo e servir ao mundo.
        Conhecê-los ajuda a entender como Deus já o tem usado — e como ainda quer usar.
      </p>
      <p class="text-body-1 mb-3">
        Este questionário é baseado no modelo de <strong>C. Peter Wagner</strong> e contém
        <strong>135 afirmações</strong> distribuídas em 27 dons espirituais.
        Responda com sinceridade, pensando em como você realmente tem vivido — não como gostaria de ser.
      </p>
      <p class="text-body-1">
        Não existe resposta certa ou errada. O objetivo é revelar padrões que Deus já colocou em você.
      </p>
    </v-card>

    <!-- Como responder + Reflexão (card único compacto) -->
    <v-card rounded="xl" class="mb-6 pa-4" elevation="1">
      <p class="text-caption font-weight-bold text-primary text-uppercase mb-2">Escala de respostas:</p>
      <div class="d-flex flex-wrap" style="gap: 6px 8px; margin-bottom: 12px">
        <v-chip
          v-for="(opt, i) in ANSWER_LABELS"
          :key="i"
          size="small"
          variant="tonal"
          color="primary"
          :prepend-icon="['mdi-numeric-0-circle-outline','mdi-numeric-1-circle-outline','mdi-numeric-2-circle-outline','mdi-numeric-3-circle-outline'][i]"
        >{{ opt.label }}</v-chip>
      </div>
      <v-divider class="mb-3" />
      <p class="text-caption font-weight-bold text-primary text-uppercase mb-2">Antes de começar, reflita:</p>
      <ul class="text-body-2 text-medium-emphasis pl-4" style="line-height: 1.8">
        <li v-for="(q, i) in reflectionQuestions" :key="i">{{ q }}</li>
      </ul>
    </v-card>

    <!-- Acesso rápido ao histórico -->
    <v-card
      v-if="hasHistory"
      rounded="xl"
      variant="outlined"
      color="primary"
      class="mb-6 pa-4 d-flex align-center justify-space-between"
    >
      <div>
        <p class="text-body-2 font-weight-medium text-primary mb-0">Você já fez testes anteriores</p>
        <p class="text-caption text-medium-emphasis mb-0">Veja seus resultados e análises anteriores</p>
      </div>
      <v-btn variant="tonal" color="primary" rounded="lg" size="small" to="/meus-resultados">
        Ver histórico
      </v-btn>
    </v-card>

    <!-- Botão -->
    <div class="text-center">
      <v-btn
        color="primary"
        size="x-large"
        rounded="xl"
        prepend-icon="mdi-play-circle"
        to="/quiz"
        min-width="260"
      >
        Iniciar Questionário
      </v-btn>
      <p class="text-caption text-medium-emphasis mt-3">
        Você pode interromper e continuar de onde parou a qualquer momento.
      </p>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { ANSWER_LABELS } from '../data/questions.js'
import { supabase } from '../services/supabase.js'

const authStore = useAuthStore()

const hasHistory = ref(false)

onMounted(async () => {
  const { count } = await supabase
    .from('responses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', authStore.user?.id)
  hasHistory.value = (count ?? 0) > 0
})

const reflectionQuestions = [
  'Quais atividades no ministério ou serviço mais te energizam?',
  'O que as pessoas costumam pedir sua ajuda ou opinião?',
  'Quando você serve, em quais áreas parece fluir mais naturalmente?',
  'Que tipo de necessidade no corpo de Cristo mais te move a agir?',
]
</script>
