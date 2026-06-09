<template>
  <v-card rounded="xl" elevation="2" class="pa-6">
<div class="d-flex align-center mb-4">
  <v-icon
    icon="mdi-bookshelf"
    color="primary"
    class="mr-2"
  />

  <h2 class="text-h6 font-weight-bold text-primary mb-2">
    Recursos
  </h2>
</div>

    <v-row>
      <v-col v-for="res in resources" :key="res.title" cols="12" sm="4">
        <v-card :href="res.url" target="_blank" rel="noopener" rounded="lg" variant="outlined"
          class="pa-4 h-100 resource-card">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <v-icon :icon="res.icon" color="primary" class="mr-2" />
              <span class="text-h6 font-weight-bold">
                {{ res.title }}
              </span>
            </div>

            <v-icon icon="mdi-open-in-new" size="18" color="medium-emphasis" />
          </div>
          <p class="text-body-2 text-medium-emphasis mb-2">{{ res.subtitle }}</p>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { resources } from '../data/resources.js'
</script>

<style scoped>
.resource-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>


<style scoped>
.v-card {
  transition: all 0.2s ease;
}
.v-card:hover {
  transform: translateY(-2px);
}
</style>
