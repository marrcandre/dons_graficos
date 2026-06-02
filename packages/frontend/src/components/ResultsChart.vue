<template>
  <v-card rounded="xl" elevation="1" class="pa-4">
    <h2 class="text-h6 font-weight-bold text-primary mb-4">Pontuação por dom</h2>
    <div ref="chartWrapperEl" style="position: relative; height: 520px">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { rankGifts } from '../services/scoring.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const props = defineProps({
  scores: { type: Object, required: true },
})

const chartWrapperEl = ref(null)

function getChartCanvas() {
  return chartWrapperEl.value?.querySelector('canvas') ?? null
}

defineExpose({ getChartCanvas })

const ranked = computed(() => rankGifts(props.scores))

// Gradiente verde: score alto = verde escuro, baixo = verde bem claro
function scoreColor(score) {
  const ratio = score / 15
  const r = Math.round(27 + (220 - 27) * (1 - ratio))
  const g = Math.round(84 + (240 - 84) * (1 - ratio))
  const b = Math.round(56 + (230 - 56) * (1 - ratio))
  return `rgb(${r},${g},${b})`
}

const chartData = computed(() => ({
  labels: ranked.value.map(({ gift }) => gift.name),
  datasets: [
    {
      label: 'Pontuação',
      data: ranked.value.map(({ score }) => score),
      backgroundColor: ranked.value.map(({ score }) => scoreColor(score)),
      borderRadius: 4,
      borderSkipped: false,
    },
  ],
}))

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.raw}/15`,
      },
    },
  },
  scales: {
    x: {
      min: 0,
      max: 15,
      ticks: { stepSize: 3 },
      grid: { color: '#e0e0e0' },
    },
    y: {
      ticks: { font: { size: 12 } },
      grid: { display: false },
    },
  },
}
</script>
