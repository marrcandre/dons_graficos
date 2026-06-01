<template>
  <v-card rounded="xl" elevation="1" class="pa-6">
    <h2 class="text-h6 font-weight-bold text-primary mb-4">E agora, o que fazer?</h2>

    <v-timeline side="end" density="compact">
      <v-timeline-item
        v-for="(step, i) in steps"
        :key="i"
        :dot-color="i === 0 ? 'primary' : 'grey-lighten-1'"
        size="small"
      >
        <div class="text-body-2">
          <strong>{{ step.title }}</strong>
          <p class="text-medium-emphasis mt-1 mb-0">{{ step.text }}</p>
        </div>
      </v-timeline-item>
    </v-timeline>
  </v-card>
</template>

<script setup>
const steps = [
  {
    title: 'Analise seus resultados com calma',
    text: 'Leia a definição de cada dom que apareceu com pontuação alta. Veja quais já eram esperados e quais te surpreenderam.',
  },
  {
    title: 'Converse com seu líder de GP',
    text: 'Compartilhe o resultado e peça feedback. O discernimento coletivo é essencial — outros enxergam dons que a gente não percebe em si mesmo.',
  },
  {
    title: 'Busque confirmação na prática',
    text: 'Os dons espirituais se confirmam quando são exercidos. Encontre oportunidades de servir nas áreas que combinam com seus resultados.',
  },
  {
    title: 'Ore e busque direção',
    text: 'Peça ao Espírito Santo que esclareça como Ele quer usar você. O teste é uma ferramenta — a direção vem d\'Ele.',
  },
]
</script>
