<template>
  <v-card rounded="xl" elevation="1" class="pa-6">
    <h2 class="text-h6 font-weight-bold text-primary mb-4">Perguntas para reflexão</h2>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Reserve um momento para refletir sobre seu resultado:
    </p>
    <v-list lines="two">
      <v-list-item
        v-for="(q, i) in questions"
        :key="i"
        :prepend-icon="'mdi-help-circle-outline'"
        class="text-body-2 py-2"
      >
        {{ q }}
      </v-list-item>
    </v-list>
    <v-divider class="my-4" />
    <p class="text-body-2 text-medium-emphasis">
      Compartilhe seu resultado com seu líder de GP ou de ministério.
      O testemunho da comunidade é parte essencial do discernimento dos dons.
    </p>
  </v-card>
</template>

<script setup>
const questions = [
  'Quais dons você já reconhecia em você mesmo? Fez sentido?',
  'Algum resultado te surpreendeu ou te deixou com dúvidas?',
  'Onde você já viu esses dons sendo usados na sua vida?',
  'Quais áreas do ministério mais combinam com o que você descobriu?',
  'O que você gostaria de desenvolver ou aprofundar a partir daqui?',
]
</script>
