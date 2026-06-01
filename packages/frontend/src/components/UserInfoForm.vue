<template>
  <v-card rounded="xl" elevation="2" class="pa-6">
    <h2 class="text-h6 font-weight-bold text-primary mb-6">Sobre você</h2>

    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-text-field
        v-model="form.name"
        label="Nome completo"
        variant="outlined"
        rounded="lg"
        :rules="[required]"
        prepend-inner-icon="mdi-account"
        class="mb-3"
        autofocus
      />

      <v-text-field
        v-model="form.gp"
        label="Grupo Pequeno (nome do apascentador)"
        variant="outlined"
        rounded="lg"
        prepend-inner-icon="mdi-account-group"
        class="mb-3"
        hint="Pode deixar em branco se não souber"
        persistent-hint
      />

      <v-text-field
        v-model="form.age"
        label="Idade"
        variant="outlined"
        rounded="lg"
        type="number"
        :rules="[ageRule]"
        prepend-inner-icon="mdi-calendar"
        class="mb-6"
      />

      <v-btn
        type="submit"
        color="primary"
        size="large"
        block
        rounded="lg"
        append-icon="mdi-arrow-right"
      >
        Iniciar Perguntas
      </v-btn>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])

const formRef = ref(null)
const form = ref({ name: '', gp: '', age: '' })

const required = (v) => !!v?.trim() || 'Campo obrigatório'
const ageRule = (v) => {
  if (!v) return true
  const n = parseInt(v)
  return (n >= 5 && n <= 120) || 'Idade inválida'
}

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  emit('submit', { ...form.value })
}
</script>
