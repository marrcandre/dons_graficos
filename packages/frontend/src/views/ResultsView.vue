<template>
  <v-container class="py-8" max-width="800">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <!-- Erro -->
    <v-alert v-else-if="error" type="error" rounded="xl" class="mb-4">{{ error }}</v-alert>

    <!-- Resultado -->
    <template v-else-if="response">
      <!-- Cabeçalho -->
      <div class="text-center mb-6">
        <h1 class="text-h5 font-weight-bold text-primary">Resultado de {{ response.name }}</h1>
        <p class="text-caption text-medium-emphasis mt-1">
          {{ formatDate(response.created_at) }}
        </p>
      </div>

      <!-- Top 3 badges -->
      <GiftBadges :scores="response.scores" class="mb-6" />

      <!-- Gráfico -->
      <ResultsChart :scores="response.scores" class="mb-6" />

      <!-- Análise IA -->
      <AiAnalysis :response-id="response.id" :initial-text="response.ai_analysis" class="mb-6" />

      <!-- Guia de reflexão -->
      <ReflectionGuide class="mb-6" />

      <!-- Próximos passos -->
      <NextStepsSection class="mb-6" />

      <!-- Recursos -->
      <ResourcesSection class="mb-6" />

      <!-- Histórico (só para o dono logado) -->
      <HistoryList v-if="isOwner" :current-id="response.id" class="mb-6" />

      <!-- Ações -->
      <div class="d-flex flex-wrap gap-3 justify-center mb-6">
        <v-btn
          prepend-icon="mdi-file-pdf-box"
          color="primary"
          variant="outlined"
          rounded="lg"
          @click="exportPDF"
          :loading="exportingPDF"
        >
          Exportar PDF
        </v-btn>
        <v-btn
          v-if="!authStore.user"
          prepend-icon="mdi-star-circle"
          color="primary"
          variant="flat"
          rounded="lg"
          to="/login"
        >
          Quero descobrir meus dons
        </v-btn>
      </div>

      <!-- Ações admin -->
      <AdminResultActions
        v-if="authStore.isAdmin"
        :response="response"
        @updated="loadResponse"
        class="mb-6"
      />
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { supabase } from '../services/supabase.js'
import GiftBadges from '../components/GiftBadges.vue'
import ResultsChart from '../components/ResultsChart.vue'
import AiAnalysis from '../components/AiAnalysis.vue'
import ReflectionGuide from '../components/ReflectionGuide.vue'
import NextStepsSection from '../components/NextStepsSection.vue'
import ResourcesSection from '../components/ResourcesSection.vue'
import HistoryList from '../components/HistoryList.vue'
import AdminResultActions from '../components/AdminResultActions.vue'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const response = ref(null)
const exportingPDF = ref(false)

const isOwner = computed(() =>
  authStore.user && response.value?.user_id === authStore.user.id
)

async function loadResponse() {
  loading.value = true
  error.value = null
  try {
    const { data, err } = await supabase
      .from('responses')
      .select('*')
      .eq('id', route.params.id)
      .single()
    if (err) throw err
    response.value = data
  } catch {
    error.value = 'Resultado não encontrado.'
  } finally {
    loading.value = false
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
}

async function exportPDF() {
  exportingPDF.value = true
  try {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')

    const element = document.querySelector('.v-container')
    const canvas = await html2canvas(element, { scale: 1.5, useCORS: true })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const ratio = canvas.height / canvas.width
    const imgHeight = pageWidth * ratio

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`dons-espirituais-${response.value.name.replace(/\s+/g, '-')}.pdf`)
  } catch (err) {
    console.error('Erro ao exportar PDF:', err)
  } finally {
    exportingPDF.value = false
  }
}

onMounted(loadResponse)
</script>
