<template>
  <v-card rounded="xl" elevation="1" class="pa-6">
    <h2 class="text-subtitle-1 font-weight-bold text-primary mb-5">
      <v-icon icon="mdi-flag-checkered" class="mr-1" />
      Próximos Passos
    </h2>
    <v-list density="compact" bg-color="transparent">
      <v-list-item v-for="(step, i) in actionSteps" :key="i" class="px-0 py-1 align-start text-body-2">
        <template #prepend>
          <v-icon icon="mdi-check-circle-outline" size="16" class="text-primary mr-2 mt-1" />
        </template>
        <span style="line-height: 1.4"><strong>{{ step.title }}:</strong> {{ step.text }}</span>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
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
  },
];
</script>

<style scoped>
@media (min-width: 960px) {
  .border-end-sm {
    border-right: 1px solid rgba(0, 0, 0, 0.08);
  }
}
</style>
