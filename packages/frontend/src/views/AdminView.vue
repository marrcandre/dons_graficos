<template>
  <v-container class="py-8" max-width="1200">
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold text-primary">Painel Admin</h1>
      <v-btn
        prepend-icon="mdi-download"
        color="primary"
        variant="outlined"
        rounded="lg"
        :loading="exporting"
        @click="exportCSV"
      >
        Exportar CSV
      </v-btn>
    </div>

    <!-- Filtros -->
    <v-card rounded="xl" elevation="1" class="pa-4 mb-4">
      <div class="d-flex gap-3 flex-wrap">
        <v-text-field
          v-model="search"
          label="Buscar por nome"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          rounded="lg"
          clearable
          style="max-width: 260px"
        />
        <v-text-field
          v-model="filterGP"
          label="Filtrar por GP"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-account-group"
          rounded="lg"
          clearable
          style="max-width: 260px"
        />
        <v-select
          v-model="filterEmailSent"
          label="Email"
          :items="emailFilterOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="compact"
          rounded="lg"
          style="max-width: 180px"
        />
      </div>
    </v-card>

    <!-- Tabela -->
    <v-card rounded="xl" elevation="1">
      <v-data-table
        :headers="headers"
        :items="filteredRows"
        :loading="loading"
        item-value="id"
        class="rounded-xl"
        :items-per-page="25"
      >
        <template #item.name="{ item }">
          <router-link :to="{ name: 'results', params: { id: item.id } }" class="text-primary font-weight-medium">
            {{ item.name }}
          </router-link>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.top_gift="{ item }">
          {{ topGift(item.scores) }}
        </template>

        <template #item.ai_analysis="{ item }">
          <v-chip :color="item.ai_analysis ? 'success' : 'warning'" size="small" variant="tonal">
            {{ item.ai_analysis ? 'Gerado' : 'Pendente' }}
          </v-chip>
        </template>

        <template #item.email_sent="{ item }">
          <v-chip :color="item.email_sent ? 'success' : 'grey'" size="small" variant="tonal">
            {{ item.email_sent ? 'Enviado' : 'Não enviado' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            variant="text"
            size="small"
            color="primary"
            :to="{ name: 'results', params: { id: item.id } }"
          />
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../services/supabase.js'
import { rankGifts } from '../services/scoring.js'

const loading = ref(true)
const exporting = ref(false)
const rows = ref([])
const search = ref('')
const filterGP = ref('')
const filterEmailSent = ref(null)

const emailFilterOptions = [
  { label: 'Todos', value: null },
  { label: 'Enviado', value: true },
  { label: 'Não enviado', value: false },
]

const headers = [
  { title: 'Nome', key: 'name', sortable: true },
  { title: 'GP', key: 'gp', sortable: true },
  { title: 'Idade', key: 'age', sortable: true, width: 80 },
  { title: 'Data', key: 'created_at', sortable: true },
  { title: 'Dom principal', key: 'top_gift', sortable: false },
  { title: 'Análise IA', key: 'ai_analysis', sortable: false, width: 130 },
  { title: 'Email', key: 'email_sent', sortable: false, width: 130 },
  { title: '', key: 'actions', sortable: false, width: 60 },
]

const filteredRows = computed(() => {
  return rows.value.filter((r) => {
    const matchSearch = !search.value || r.name?.toLowerCase().includes(search.value.toLowerCase())
    const matchGP = !filterGP.value || r.gp?.toLowerCase().includes(filterGP.value.toLowerCase())
    const matchEmail = filterEmailSent.value === null || r.email_sent === filterEmailSent.value
    return matchSearch && matchGP && matchEmail
  })
})

onMounted(async () => {
  const { data, error } = await supabase
    .from('responses')
    .select('id, name, email, gp, age, created_at, scores, ai_analysis, email_sent')
    .order('created_at', { ascending: false })

  if (!error) rows.value = data ?? []
  loading.value = false
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  })
}

function topGift(scores) {
  if (!scores) return '—'
  return rankGifts(scores)[0]?.gift.name ?? '—'
}

function exportCSV() {
  exporting.value = true

  const cols = ['nome', 'email', 'gp', 'idade', 'data', 'dom_principal', 'ia_gerado', 'email_enviado', 'id']
  const csvRows = [cols.join(',')]

  for (const r of filteredRows.value) {
    const row = [
      `"${r.name ?? ''}"`,
      `"${r.email ?? ''}"`,
      `"${r.gp ?? ''}"`,
      r.age ?? '',
      formatDate(r.created_at),
      `"${topGift(r.scores)}"`,
      r.ai_analysis ? 'sim' : 'não',
      r.email_sent ? 'sim' : 'não',
      r.id,
    ]
    csvRows.push(row.join(','))
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dons-espirituais-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  exporting.value = false
}
</script>
