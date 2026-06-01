<template>
  <v-card rounded="xl" elevation="1" class="pa-6">
    <h2 class="text-h6 font-weight-bold text-primary mb-4">Recursos para aprofundar</h2>
    <v-list>
      <v-list-item
        v-for="resource in resources"
        :key="resource.url"
        :href="resource.url"
        target="_blank"
        rel="noopener noreferrer"
        :prepend-icon="resource.icon"
        :title="resource.title"
        :subtitle="resource.subtitle"
        rounded="lg"
        class="mb-1"
        append-icon="mdi-open-in-new"
      />
    </v-list>
  </v-card>
</template>

<script setup>
const resources = [
  {
    title: 'Descrição detalhada dos dons',
    subtitle: 'O que significa cada dom espiritual',
    icon: 'mdi-book-open-page-variant',
    url: 'https://tinyurl.com/57y3mw83',
  },
  {
    title: 'Material completo sobre o Espírito Santo',
    subtitle: 'Aprofunde-se no tema dos dons espirituais',
    icon: 'mdi-fire',
    url: 'https://tinyurl.com/5xmzbz9s',
  },
  {
    title: 'Curso em vídeo',
    subtitle: 'Aprenda mais sobre dons espirituais na prática',
    icon: 'mdi-play-circle',
    url: 'https://tinyurl.com/pepsapmt',
  },
]
</script>
