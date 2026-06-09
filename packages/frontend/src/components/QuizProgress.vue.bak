<template>
  <div class="mb-4">
    <div class="d-flex justify-space-between text-caption text-medium-emphasis mb-1">
      <span>Questão {{ current }} de {{ total }}</span>
      <span>{{ progress }}% concluído</span>
    </div>
    <v-progress-linear
      :model-value="progress"
      color="primary"
      rounded
      height="8"
      bg-color="grey-lighten-3"
    />
  </div>
</template>

<script setup>
defineProps({
  progress: { type: Number, required: true },
  current: { type: Number, required: true },
  total: { type: Number, required: true },
})
</script>
