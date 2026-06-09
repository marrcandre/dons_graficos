<template>
  <v-container class="py-6" max-width="680">
    <!-- Dialog: retomar ou recomeçar -->
    <v-dialog v-model="showResumeDialog" max-width="440" persistent>
      <v-card rounded="xl" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold text-primary">
          Teste em andamento
        </v-card-title>
        <v-card-text>
          Você tem <strong>{{ quizStore.savedAnswerCount }} de 135</strong> respostas salvas.
          Deseja continuar de onde parou?
        </v-card-text>
        <v-card-actions class="justify-end gap-2">
          <v-btn variant="outlined" color="grey" @click="handleStartFresh">Recomeçar</v-btn>
          <v-btn color="primary" variant="flat" @click="handleResume">Continuar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Etapa 1: Dados do usuário -->
    <UserInfoForm
      v-if="step === 'userInfo'"
      @submit="handleUserInfoSubmit"
    />

    <!-- Etapa 2: Teste -->
    <template v-else-if="step === 'quiz'">
      <QuizProgress :progress="quizStore.progress" :current="quizStore.currentIndex + 1" :total="quizStore.totalQuestions" />
      <QuestionStep
        v-if="quizStore.currentQuestion"
        :question="quizStore.currentQuestion"
        :model-value="quizStore.answers[quizStore.currentQuestionId]"
        @update:model-value="handleAnswer"
        @next="handleNext"
        @prev="handlePrev"
        :is-first="quizStore.currentIndex === 0"
        :is-last="quizStore.currentIndex === quizStore.totalQuestions - 1"
      />
    </template>

    <!-- Etapa 3: Enviando -->
    <div v-else-if="step === 'submitting'" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
      <p class="text-h6 text-medium-emphasis">Salvando seus resultados...</p>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz.js'
import { useAuthStore } from '../stores/auth.js'
import { calculateScores } from '../services/scoring.js'
import { supabase } from '../services/supabase.js'
import UserInfoForm from '../components/UserInfoForm.vue'
import QuizProgress from '../components/QuizProgress.vue'
import QuestionStep from '../components/QuestionStep.vue'

const router = useRouter()
const quizStore = useQuizStore()
const authStore = useAuthStore()

const step = ref('loading')
const showResumeDialog = ref(false)
const autoAdvancing = ref(false)

function preMarkZeroIfBlank() {
  const id = quizStore.currentQuestionId
  if (quizStore.answers[id] === undefined) {
    quizStore.setAnswer(id, 0)
  }
}

onMounted(() => {
  const hasSaved = quizStore.checkSavedState()
  if (hasSaved) {
    showResumeDialog.value = true
  } else {
    quizStore.startFresh()
    step.value = 'userInfo'
  }
})

function handleResume() {
  showResumeDialog.value = false
  quizStore.restoreSaved()
  // Se ainda não tem userInfo preenchido, voltar para essa etapa
  step.value = quizStore.userInfo.name ? 'quiz' : 'userInfo'
}

function handleStartFresh() {
  showResumeDialog.value = false
  quizStore.startFresh()
  step.value = 'userInfo'
}

function handleUserInfoSubmit(info) {
  quizStore.setUserInfo(info)
  step.value = 'quiz'
  preMarkZeroIfBlank()
}

function handleAnswer(val) {
  const isLast = quizStore.currentIndex === quizStore.totalQuestions - 1
  quizStore.setAnswer(quizStore.currentQuestionId, val)

  // Auto-avanço após 350ms para o usuário ver a seleção
  if (!autoAdvancing.value) {
    autoAdvancing.value = true
    setTimeout(async () => {
      autoAdvancing.value = false
      if (isLast) {
        await submitQuiz()
      } else {
        quizStore.nextQuestion()
        preMarkZeroIfBlank()
      }
    }, 350)
  }
}

function handlePrev() {
  quizStore.prevQuestion()
  preMarkZeroIfBlank()
}

async function handleNext() {
  if (!quizStore.isComplete) {
    quizStore.nextQuestion()
    preMarkZeroIfBlank()
    return
  }
  await submitQuiz()
}

async function submitQuiz() {
  step.value = 'submitting'

  try {
    const answers = quizStore.answers
    const scores = calculateScores(answers)
    const { name, gp, age } = quizStore.userInfo

    const payload = {
      user_id: authStore.user.id,
      name: name.trim(),
      email: authStore.user.email,
      gp: gp.trim(),
      age: parseInt(age) || null,
      question_order: quizStore.questionOrder,
      answers: Object.values(answers), // array indexado por question id (0–134)
      scores,
    }

    const { data, error } = await supabase
      .from('responses')
      .insert(payload)
      .select('id')
      .single()

    if (error) throw error

    quizStore.clearState()

    // Disparar análise IA de forma assíncrona (não bloquear redirect)
    supabase.functions
      .invoke('generate-ai', { body: { responseId: data.id } })
      .then(({ error }) => {
        if (error) console.error('Erro ao iniciar geração IA:', error)
      })
      .catch((err) => {
        console.error('Erro ao iniciar geração IA:', err)
      })

    router.push({ name: 'results', params: { id: data.id } })
  } catch (err) {
    console.error('Erro ao salvar respostas:', err)
    step.value = 'quiz'
    // Volta para quiz; estado está preservado no localStorage
  }
}
</script>
