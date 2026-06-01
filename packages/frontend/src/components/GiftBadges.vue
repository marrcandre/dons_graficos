<template>
  <v-card rounded="xl" elevation="1" class="pa-4">
    <h2 class="text-h6 font-weight-bold text-primary mb-4">Seus dons em destaque</h2>
    <div class="d-flex flex-wrap gap-3 justify-center">
      <v-card
        v-for="({ gift, score }, i) in top3"
        :key="gift.id"
        :elevation="i === 0 ? 4 : 2"
        rounded="xl"
        class="pa-4 text-center"
        color="secondary"
        :min-width="i === 0 ? 180 : 150"
      >
        <div class="text-caption text-white opacity-80 mb-1">
          {{ ['🥇 1º', '🥈 2º', '🥉 3º'][i] }}
        </div>
        <v-icon :icon="gift.icon" size="32" color="white" class="mb-1" />
        <div class="text-subtitle-1 font-weight-bold text-white">{{ gift.name }}</div>
        <div class="text-h5 font-weight-black text-white">{{ score }}<span class="text-caption">/15</span></div>
      </v-card>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { gifts } from '../data/gifts.js'
import { rankGifts } from '../services/scoring.js'

const props = defineProps({
  scores: { type: Object, required: true },
})

const top3 = computed(() => rankGifts(props.scores).slice(0, 3))
</script>
