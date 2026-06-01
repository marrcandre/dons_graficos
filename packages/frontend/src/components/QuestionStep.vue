<template>
  <v-card rounded="xl" elevation="2" class="pa-6">
    <p class="text-body-1 font-weight-medium mb-6" style="line-height: 1.6">
      {{ question.text }}
    </p>

    <v-btn-toggle
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      color="primary"
      variant="outlined"
      divided
      rounded="xl"
      class="flex-wrap w-100 mb-6"
      mandatory
    >
      <v-btn
        v-for="opt in ANSWER_LABELS"
        :key="opt.value"
        :value="opt.value"
        class="flex-1-1"
        style="min-width: 140px; height: 56px"
      >
        {{ opt.label }}
      </v-btn>
    </v-btn-toggle>

    <div class="d-flex justify-space-between gap-2">
      <v-btn
        variant="outlined"
        color="grey"
        prepend-icon="mdi-arrow-left"
        :disabled="isFirst"
        @click="$emit('prev')"
      >
        Anterior
      </v-btn>

      <v-btn
        color="primary"
        :append-icon="isLast ? 'mdi-check-circle' : 'mdi-arrow-right'"
        :disabled="modelValue === undefined || modelValue === null"
        @click="$emit('next')"
      >
        {{ isLast ? 'Finalizar' : 'Próxima' }}
      </v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { ANSWER_LABELS } from '../data/questions.js'

defineProps({
  question: { type: Object, required: true },
  modelValue: { type: Number, default: undefined },
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'next', 'prev'])
</script>
