<template>
  <v-container class="py-8" max-width="800">

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <!-- Erro -->
    <v-alert v-else-if="error" type="error" rounded="xl" class="mb-4">
      {{ error }}
    </v-alert>

    <!-- Resultado -->
<!-- Resultado -->
<template v-else-if="response">

  <!-- Cabeçalho -->
  <div class="text-center mb-8">
    <h1 class="text-h4 font-weight-bold text-primary mb-2">
      {{ response.name }}
    </h1>

    <p class="text-body-1 text-medium-emphasis">
      Seu Perfil de Dons Espirituais
    </p>
  </div>

  <!-- Top 3 dons -->
  <GiftBadges
    :scores="response.scores"
    class="mb-6"
  />

  <!-- Gráfico -->
  <ResultsChart
    ref="chartRef"
    :scores="response.scores"
    class="mb-8"
  />

  <!-- Análise IA -->
  <v-card
    rounded="xl"
    elevation="1"
    class="mb-6"
  >
    <AiAnalysis
      :response-id="response.id"
      :initial-text="response.ai_analysis"
    />
  </v-card>

  <!-- Crescimento -->
  <GrowthSection
    ref="growthRef"
    class="mb-6"
  />

  <!-- Recursos -->
  <ResourcesSection
    ref="resourcesRef"
    class="mb-6"
  />

  <!-- Histórico -->
  <HistoryList
    v-if="isOwner"
    :current-id="response.id"
    class="mb-6"
  />

  <!-- Ações -->
  <v-card
    rounded="xl"
    variant="outlined"
    class="mb-6 pa-4"
  >
    <div class="d-flex flex-wrap justify-center ga-3">

      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-download"
        @click="exportPDF"
        :loading="exportingPDF"
      >
        Baixar PDF
      </v-btn>

      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-share-variant"
        @click="shareResult"
      >
        Compartilhar
      </v-btn>

      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-printer"
        @click="printResult"
      >
        Imprimir
      </v-btn>

      <v-btn
        v-if="!authStore.user"
        color="primary"
        prepend-icon="mdi-gift-outline"
        to="/login"
      >
        Quero descobrir meus dons
      </v-btn>

    </div>
  </v-card>

  <!-- Data -->
  <div class="text-center">
    <p class="text-caption text-medium-emphasis">
      Teste realizado em {{ formatDate(response.created_at) }}
    </p>
  </div>

</template>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { supabase } from '../services/supabase.js'

import GrowthSection from '../components/GrowthSection.vue'
import GiftBadges from '../components/GiftBadges.vue'
import ResultsChart from '../components/ResultsChart.vue'
import AiAnalysis from '../components/AiAnalysis.vue'
import ResourcesSection from '../components/ResourcesSection.vue'
import HistoryList from '../components/HistoryList.vue'
import { resources } from '../data/resources.js'

const route = useRoute()
// Refs for PDF sections
const growthRef = ref(null)
const resourcesRef = ref(null)
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const response = ref(null)
const exportingPDF = ref(false)
const chartRef = ref(null)

const isOwner = computed(() =>
  authStore.user &&
  response.value?.user_id === authStore.user.id
)

async function loadResponse() {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await supabase
      .from('responses')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (fetchError) throw fetchError

    response.value = data
  } catch {
    error.value = 'Resultado não encontrado.'
  } finally {
    loading.value = false
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

async function shareResult() {
  const url = window.location.href

  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Meu Resultado - Dons Espirituais',
        text: 'Confira o resultado do meu teste de dons espirituais',
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copiado para a área de transferência.')
    }
  } catch (err) {
    console.error('Erro ao compartilhar:', err)
  }
}

function printResult() {
  window.print()
}

async function exportPDF() {
  exportingPDF.value = true

  try {
    const [{ default: jsPDF }, { default: html2canvas }] =
      await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    })

    const W = pdf.internal.pageSize.getWidth()
    const H = pdf.internal.pageSize.getHeight()

    const margin = 16
    const contentW = W - margin * 2

    // Cabeçalho
    pdf.setFillColor(27, 84, 56)
    pdf.rect(0, 0, W, 22, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(13)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Dons Espirituais', margin, 14)

    // Nome
    pdf.setTextColor(40, 40, 40)
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(response.value.name, margin, 36)

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text(
      formatDate(response.value.created_at),
      margin,
      43
    )

    // Gráfico
    const canvas = chartRef.value?.getChartCanvas()

    if (canvas) {
      const chartImg = await html2canvas(canvas, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = chartImg.toDataURL('image/png')

      const chartH =
        (chartImg.height / chartImg.width) * contentW

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        52,
        contentW,
        Math.min(chartH, H - 70)
      )
    }

    // Capturar seções adicionais (Guia de reflexão, Próximos passos, Recursos)
    const sections = [
      { ref: growthRef, title: 'Reflexão e Crescimento' },
      { ref: resourcesRef, title: 'Recursos' },
    ]

    for (const sec of sections) {
      if (sec.ref?.value) {
        // Render component root element (may be a Vue component)
        const el = sec.ref.value.$el || sec.ref.value
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        })
        const imgData = canvas.toDataURL('image/png')
        const imgH = (canvas.height / canvas.width) * contentW
        pdf.addPage()
        pdf.setFillColor(27, 84, 56)
        pdf.rect(0, 0, W, 22, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(13)
        pdf.setFont('helvetica', 'bold')
        pdf.text(sec.title, margin, 14)
        pdf.setFillColor(255, 255, 255)
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          22,
          contentW,
          Math.min(imgH, H - 22)
        )
      }
    }

    // Resources clickable links page
    if (resources && resources.length) {
      pdf.addPage();
      pdf.setFillColor(27, 84, 56);
      pdf.rect(0, 0, W, 22, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recursos', margin, 14);

      const startY = 30;
      let curY = startY;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 255);
      for (const res of resources) {
        const text = `${res.title}: ${res.subtitle}`;
        pdf.textWithLink(text, margin, curY, { url: res.url });
        curY += 6;
        if (curY > H - margin) {
          pdf.addPage();
          curY = margin;
        }
      }
    }

    // Página da análise IA
    const aiText = response.value.ai_analysis

    if (aiText) {
      pdf.addPage()

      pdf.setFillColor(27, 84, 56)
      pdf.rect(0, 0, W, 22, 'F')

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(13)
      pdf.setFont('helvetica', 'bold')
      pdf.text(
        'Reflexão sobre seus dons',
        margin,
        14
      )

      pdf.setTextColor(40, 40, 40)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')

      const lines = pdf.splitTextToSize(
        aiText,
        contentW
      )

      let y = 34
      const lineH = 6

      for (const line of lines) {
        if (y + lineH > H - margin) {
          pdf.addPage()
          y = margin
        }

        pdf.text(line, margin, y)
        y += lineH
      }
    }

    const slug = response.value.name
      .replace(/\s+/g, '-')
      .toLowerCase()

    pdf.save(`dons-espirituais-${slug}.pdf`)
  } catch (err) {
    console.error(
      'Erro ao exportar PDF:',
      err
    )
  } finally {
    exportingPDF.value = false
  }
}

onMounted(loadResponse)
</script>
