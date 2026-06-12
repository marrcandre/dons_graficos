<template>
  <v-container class="py-8" max-width="1200">
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h5 font-weight-bold text-primary">Painel Admin</h1>
    </div>

    <!-- Filtros -->
    <v-card rounded="xl" elevation="2" class="pa-4 mb-4">
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

        <!-- NOVO FILTRO -->
        <v-checkbox v-model="filterWithoutAI" label="Sem análise" density="compact" />
      </div>
    </v-card>

    <!-- DASHBOARD -->
    <v-row class="mb-4">
      <v-col cols="6" sm="3">
        <div class="d-flex align-center ga-2">
          <v-icon size="18" color="primary"> mdi-calendar-today </v-icon>
          <span class="text-caption">Hoje:</span>
          <strong>{{ totalToday }}</strong>
        </div>
      </v-col>

      <v-col cols="6" sm="3">
        <div class="d-flex align-center ga-2">
          <v-icon size="18" color="primary"> mdi-calendar-week </v-icon>
          <span class="text-caption">Semana:</span>
          <strong>{{ totalWeek }}</strong>
        </div>
      </v-col>

      <v-col cols="6" sm="3">
        <div class="d-flex align-center ga-2">
          <v-icon size="18" color="primary"> mdi-counter </v-icon>
          <span class="text-caption">Total:</span>
          <strong>{{ total }}</strong>
        </div>
      </v-col>

      <v-col cols="6" sm="3">
        <div class="d-flex align-center ga-2">
          <v-icon size="18" color="warning"> mdi-file-document-alert-outline </v-icon>
          <span class="text-caption">Sem análise:</span>
          <strong>{{ totalWithoutAI }}</strong>
        </div>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" variant="tonal" rounded="xl" class="mb-4">
      {{ error }}
      <template #append>
        <v-btn variant="text" color="error" @click="loadRows">Tentar novamente</v-btn>
      </template>
    </v-alert>

    <v-card rounded="xl" elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredRows"
        :loading="loading"
        item-value="id"
        class="rounded-xl"
        :items-per-page="25"
      >
        <template #item.status="{ item }">
          <div class="d-flex align-center ga-3">
            <!-- EMAIL -->
            <v-icon size="20" class="status-icon" :class="{ active: item.email_sent }">
              mdi-email-outline
            </v-icon>

            <!-- RESULTADO -->
            <v-tooltip text="Abrir resultado">
              <template #activator="{ props }">
                <v-icon
                  v-bind="props"
                  size="20"
                  class="status-icon clickable"
                  :class="{ active: item.ai_analysis }"
                  @click.stop="goToResult(item.id)"
                >
                  mdi-file-document-outline
                </v-icon>
              </template>
            </v-tooltip>
          </div>
        </template>

        <!-- Nome -->
        <template #item.name="{ item }">
          <v-text-field
            v-if="editingName === item.id"
            v-model="item.name"
            density="compact"
            variant="underlined"
            hide-details
            autofocus
            @blur="saveName(item)"
            @keyup.enter="saveName(item)"
          />

          <span
            v-else
            class="text-primary font-weight-medium"
            style="cursor: pointer"
            @click="editingName = item.id"
          >
            {{ item.name }}
          </span>
        </template>

        <!-- GP -->
        <template #item.gp="{ item }">
          <v-text-field
            v-if="editingGP === item.id"
            v-model="item.gp"
            density="compact"
            variant="underlined"
            hide-details
            autofocus
            @blur="saveGP(item)"
            @keyup.enter="saveGP(item)"
          />

          <span v-else style="cursor: pointer" @click="editingGP = item.id">
            {{ item.gp }}
          </span>
        </template>

        <!-- Data e Hora -->
        <template #item.created_at="{ item }">
          {{ formatDateTime(item.created_at) }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../services/supabase.js";
import { runSupabaseQuery } from "../services/supabaseQuery.js";

const router = useRouter();

const loading = ref(true);
const error = ref(null);
const rows = ref([]);

const search = ref("");
const filterGP = ref("");
const filterWithoutAI = ref(false);

const editingName = ref(null);
const editingGP = ref(null);

function goToResult(id) {
  router.push({ name: "results", params: { id } });
}

async function updateField(id, field, value) {
  try {
    const { error } = await runSupabaseQuery(
      supabase
        .from("responses")
        .update({
          [field]: value?.trim(),
        })
        .eq("id", id)
    );

    if (error) throw error;
  } catch (err) {
    console.error(`Erro ao atualizar ${field}:`, err);
  }
}

async function saveName(item) {
  item.name = item.name?.trim();

  await updateField(item.id, "name", item.name);

  editingName.value = null;
}

async function saveGP(item) {
  item.gp = item.gp?.trim();

  await updateField(item.id, "gp", item.gp);

  editingGP.value = null;
}

const total = computed(() => rows.value.length);

const totalToday = computed(() => {
  const today = new Date().toDateString();

  return rows.value.filter((r) => new Date(r.created_at).toDateString() === today).length;
});

const totalWeek = computed(() => {
  const now = new Date();
  const weekStart = new Date();
  weekStart.setDate(now.getDate() - now.getDay());

  return rows.value.filter((r) => new Date(r.created_at) >= weekStart).length;
});

const totalWithoutAI = computed(() => rows.value.filter((r) => !r.ai_analysis).length);

const headers = [
  { title: "", key: "status", sortable: false, width: 70 },
  { title: "Nome", key: "name", sortable: true },
  { title: "GP", key: "gp", sortable: true },
  { title: "Respondido em", key: "created_at", sortable: true },
  { title: "Idade", key: "age", sortable: true, width: 40 },
];

const filteredRows = computed(() => {
  return rows.value.filter((r) => {
    const matchSearch =
      !search.value || r.name?.toLowerCase().includes(search.value.toLowerCase());

    const matchGP =
      !filterGP.value || r.gp?.toLowerCase().includes(filterGP.value.toLowerCase());

    const matchAI = !filterWithoutAI.value || !r.ai_analysis;

    return matchSearch && matchGP && matchAI;
  });
});

onMounted(loadRows);

async function loadRows() {
  loading.value = true;
  error.value = null;

  try {
    const { data, error: fetchError } = await runSupabaseQuery(
      supabase
        .from("responses")
        .select("id, name, gp, age, created_at, scores, ai_analysis, email_sent")
        .order("created_at", { ascending: false })
    );

    if (fetchError) throw fetchError;
    rows.value = data ?? [];
  } catch (err) {
    console.error(err);
    error.value = "Erro ao carregar painel admin";
  } finally {
    loading.value = false;
  }
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped>
.v-card {
  transition: all 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}

.status-icon {
  cursor: default;
  transition: all 0.15s ease;
  color: #9e9e9e;
}

.status-icon:hover {
  transform: scale(1.15);
}

.status-icon.active {
  color: rgb(var(--v-theme-primary));
}

.clickable {
  cursor: pointer;
}
</style>
