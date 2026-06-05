<template>
  <v-card rounded="xl" elevation="1" class="pa-6">
    <h2 class="text-subtitle-1 font-weight-bold text-primary mb-5 text-center text-sm-left">
      <v-icon icon="mdi-compass-outline" class="mr-1" />
      Guia de Próximos Passos
    </h2>

    <v-row>
      <!-- Coluna 1: Refletir -->
      <v-col cols="12" md="4" class="border-end-sm pr-md-4">
        <div class="d-flex align-center mb-3">
          <v-avatar color="primary" variant="tonal" size="32" class="mr-2">
            <span class="text-body-2 font-weight-bold">1</span>
          </v-avatar>
          <h3 class="text-body-1 font-weight-bold text-primary">Refletir</h3>
        </div>
        <p class="text-caption text-medium-emphasis mb-3">Reserve um momento para avaliar seu resultado:</p>
        <v-list density="compact" bg-color="transparent">
          <v-list-item
            v-for="(q, i) in reflectionQuestions"
            :key="i"
            class="px-0 py-1 align-start text-body-2"
          >
            <template #prepend>
              <v-icon icon="mdi-help-circle-outline" size="16" class="text-medium-emphasis mr-2 mt-1" />
            </template>
            <span style="line-height: 1.4">{{ q }}</span>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Coluna 2: Agir -->
      <v-col cols="12" md="4" class="border-end-sm px-md-4 py-6 py-md-3">
        <div class="d-flex align-center mb-3">
          <v-avatar color="primary" variant="tonal" size="32" class="mr-2">
            <span class="text-body-2 font-weight-bold">2</span>
          </v-avatar>
          <h3 class="text-body-1 font-weight-bold text-primary">Agir</h3>
        </div>
        <p class="text-caption text-medium-emphasis mb-3">Coloque seus dons espirituais em prática:</p>
        <v-list density="compact" bg-color="transparent">
          <v-list-item
            v-for="(step, i) in actionSteps"
            :key="i"
            class="px-0 py-1 align-start text-body-2"
          >
            <template #prepend>
              <v-icon icon="mdi-check-circle-outline" size="16" class="text-primary mr-2 mt-1" />
            </template>
            <span style="line-height: 1.4"><strong>{{ step.title }}:</strong> {{ step.text }}</span>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Coluna 3: Aprofundar -->
      <v-col cols="12" md="4" class="pl-md-4">
        <div class="d-flex align-center mb-3">
          <v-avatar color="primary" variant="tonal" size="32" class="mr-2">
            <span class="text-body-2 font-weight-bold">3</span>
          </v-avatar>
          <h3 class="text-body-1 font-weight-bold text-primary">Aprofundar</h3>
        </div>
        <p class="text-caption text-medium-emphasis mb-3">Materiais recomendados para estudo:</p>
        <v-list density="compact" bg-color="transparent">
          <v-list-item
            v-for="res in resources"
            :key="res.url"
            :href="res.url"
            target="_blank"
            rel="noopener noreferrer"
            class="px-2 py-1 mb-2 rounded-lg text-body-2 bg-grey-lighten-5 border"
            append-icon="mdi-open-in-new"
          >
            <template #prepend>
              <v-icon :icon="res.icon" size="18" class="text-medium-emphasis mr-2" />
            </template>
            <div>
              <div class="font-weight-bold text-high-emphasis text-truncate">{{ res.title }}</div>
              <div class="text-caption text-medium-emphasis text-truncate">{{ res.subtitle }}</div>
            </div>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
const reflectionQuestions = [
  'Quais dons você já reconhecia em si mesmo? Fez sentido?',
  'Algum resultado te surpreendeu ou gerou dúvidas?',
  'Onde você já viu esses dons em ação na sua vida?'
]

const actionSteps = [
  {
    title: 'Comunhão',
    text: 'Converse com seu líder de GP/ministério para discernimento coletivo.',
  },
  {
    title: 'Prática',
    text: 'Busque oportunidades na prática para exercitar o que descobriu.',
  },
  {
    title: 'Oração',
    text: 'Peça direção ao Espírito Santo sobre como Ele quer usar você.',
  }
]

const resources = [
  {
    title: 'Definição dos Dons',
    subtitle: 'Significado de cada dom',
    icon: 'mdi-book-open-page-variant',
    url: 'https://tinyurl.com/57y3mw83',
  },
  {
    title: 'Espírito Santo',
    subtitle: 'Material completo de estudo',
    icon: 'mdi-fire',
    url: 'https://tinyurl.com/5xmzbz9s',
  },
  {
    title: 'Curso Prático',
    subtitle: 'Aprenda sobre dons em vídeo',
    icon: 'mdi-play-circle',
    url: 'https://tinyurl.com/pepsapmt',
  },
]
</script>

<style scoped>
@media (min-width: 960px) {
  .border-end-sm {
    border-right: 1px solid rgba(0, 0, 0, 0.08);
  }
}
</style>
