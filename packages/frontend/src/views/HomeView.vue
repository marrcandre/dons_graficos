<template>
  <v-container class="py-8" max-width="700">

    <!-- Cabeçalho -->
    <div class="text-center mb-8">
      <img
        src="/favicon.svg"
        alt="Dons Espirituais"
        width="64"
        height="64"
        class="mb-3"
      />

      <h1 class="text-h4 font-weight-bold text-primary mb-2">
        Dons Espirituais
      </h1>

      <p class="text-body-1 text-medium-emphasis mb-4">
        Descubra como Deus já o capacitou para servir e edificar o corpo de Cristo.
      </p>

      <p class="text-body-2 text-medium-emphasis">
        Olá,
        <strong>
          {{ authStore.profile?.name || authStore.user?.user_metadata?.full_name }}
        </strong>!
        Que bom ter você aqui.
      </p>
    </div>

    <!-- Histórico -->
    <v-card
      v-if="hasHistory"
      rounded="xl"
      class="mb-6 pa-5 d-flex align-center justify-space-between"
      elevation="1"
    >
      <div>
        <p class="text-subtitle-1 font-weight-bold text-primary mb-1">
          Histórico de resultados
        </p>

        <p class="text-body-2 text-medium-emphasis mb-0">
          Veja seus resultados e análises anteriores.
        </p>
      </div>

      <v-btn
        variant="tonal"
        color="primary"
        rounded="lg"
        size="small"
        to="/meus-resultados"
      >
        Ver histórico
      </v-btn>
    </v-card>

    <!-- Sobre o questionário -->
    <v-card
      rounded="xl"
      class="mb-6 pa-5"
      elevation="1"
    >
      <p class="text-subtitle-1 font-weight-bold text-primary mb-4">
        Sobre o questionário
      </p>

      <p class="text-body-1 mb-3">
        Este questionário é baseado no modelo de
        <strong>C. Peter Wagner</strong>
        e avalia
        <strong>27 dons espirituais</strong>
        por meio de
        <strong>135 afirmações</strong>.
      </p>

      <p class="text-body-1">
        Responda com sinceridade, considerando como você realmente age e serve hoje.
        Não existem respostas certas ou erradas.
      </p>
    </v-card>

    <!-- Preparação -->
    <v-card
      rounded="xl"
      class="pa-5"
      elevation="1"
    >
      <p class="text-subtitle-1 font-weight-bold text-primary mb-4">
        Preparação para o questionário
      </p>

      <p class="text-body-1 font-weight-medium mb-3">
        Como responder
      </p>

      <div
        class="d-flex flex-wrap mb-5"
        style="gap: 6px 8px;"
      >
        <v-chip
          v-for="(opt, i) in ANSWER_LABELS"
          :key="i"
          size="small"
          variant="tonal"
          color="primary"
          :prepend-icon="[
            'mdi-numeric-0-circle-outline',
            'mdi-numeric-1-circle-outline',
            'mdi-numeric-2-circle-outline',
            'mdi-numeric-3-circle-outline'
          ][i]"
        >
          {{ opt.label }}
        </v-chip>
      </div>

      <v-divider class="mb-4" />

      <p class="text-body-1 font-weight-medium mb-3">
        Antes de começar, reflita:
      </p>

      <ul
        class="text-body-1 pl-4"
        style="line-height: 1.8"
      >
        <li
          v-for="(q, i) in reflectionQuestions"
          :key="i"
        >
          {{ q }}
        </li>
      </ul>
    </v-card>

  </v-container>
    <!-- Iniciar Questionário -->
    <div class="text-center mb-6">
      <v-btn
        color="primary"
        size="large"
        rounded="xl"
        prepend-icon="mdi-play-circle"
        to="/quiz"
        min-width="240"
      >
        Iniciar Questionário
      </v-btn>

      <p class="text-body-2 text-medium-emphasis mt-3">
        Você pode interromper e continuar de onde parou a qualquer momento.
      </p>
    </div>


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
