import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GIFTS_ORDER = [
  'Profecia', 'Pastor', 'Ensino', 'Sabedoria', 'Conhecimento', 'Exortação',
  'Discernimento de Espíritos', 'Contribuição', 'Socorro', 'Misericórdia',
  'Missionário', 'Evangelista', 'Hospitalidade', 'Dom da Fé', 'Liderança',
  'Administração', 'Operação de Milagres', 'Dons de Cura', 'Línguas',
  'Interpretação de Línguas', 'Pobreza Voluntária', 'Celibato', 'Intercessão',
  'Libertação', 'Serviço', 'Apóstolo', 'Liderança de Adoração',
]

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash'
const GEMINI_FALLBACK_MODELS = (Deno.env.get('GEMINI_FALLBACK_MODELS') ?? 'gemini-2.5-flash-lite')
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean)

const GEMINI_TIMEOUT_MS = Number(Deno.env.get('GEMINI_TIMEOUT_MS') ?? 25000)
const GEMINI_THINKING_BUDGET = Number(Deno.env.get('GEMINI_THINKING_BUDGET') ?? 0)

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

function buildPrompt(name: string, scoresFormatted: string): string {
  return `Você é um pastor evangélico experiente em dons espirituais conforme o modelo de Peter Wagner (livro "Descubra Seus Dons Espirituais").

DIRETRIZ CRÍTICA DE TAMANHO: Sua análise COMPLETA deve ser breve, direta e ter no máximo 2000 caracteres (incluindo espaços).

${name} realizou o teste de dons espirituais.

Resultados:
${scoresFormatted}

Escreva uma análise pastoral em 5 parágrafos curtos, com orientação direta ao usuário.`
}

function formatScores(scores: Record<string, number>): string {
  return GIFTS_ORDER
    .map((name, id) => ({ name, score: scores[id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .map(({ name, score }) => `${name}: ${score}/15`)
    .join('\n')
}

async function generateGeminiAnalysis(prompt: string, apiKey: string) {
  const models = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS]
  let lastError: Error | null = null

  for (const model of models) {
    try {
      const res = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
              thinkingConfig: {
                thinkingBudget: GEMINI_THINKING_BUDGET,
              },
            },
          }),
        },
        GEMINI_TIMEOUT_MS,
      )

      if (!res.ok) {
        const errText = await res.text()

        const err = new Error(
          `Gemini error (${res.status}) using ${model}: ${errText}`
        )

        if (res.status === 429 || res.status === 503) {
          lastError = err
          console.warn(err.message)
          continue
        }

        throw err
      }

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

      if (!text) throw new Error(`Resposta vazia Gemini (${model})`)

      return { text, model }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Erro desconhecido')

      if (lastError.name === 'AbortError') {
        console.warn(`Timeout Gemini (${model})`)
        continue
      }

      throw lastError
    }
  }

  throw lastError ?? new Error('Nenhum modelo disponível')
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
  const notifyUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-admin`

  if (!geminiApiKey) {
    return jsonResponse({ error: 'GEMINI_API_KEY não configurada' }, 500)
  }

  let responseId: string
  let force = false

  try {
    const body = await req.json()
    responseId = body.responseId
    force = body.force === true
    if (!responseId) throw new Error('responseId obrigatório')
  } catch {
    return jsonResponse({ error: 'Body inválido' }, 400)
  }

  const { data: response, error: fetchError } = await supabase
    .from('responses')
    .select('id, name, email, gp, age, scores, ai_analysis')
    .eq('id', responseId)
    .single()

  if (fetchError || !response) {
    return jsonResponse({ error: 'Resposta não encontrada' }, 404)
  }

  if (response.ai_analysis && !force) {
    return jsonResponse({ success: true, skipped: true })
  }

  const scoresFormatted = formatScores(response.scores)
  const prompt = buildPrompt(response.name, scoresFormatted)

  let aiAnalysis: string
  let usedModel = GEMINI_MODEL

  try {
    const result = await generateGeminiAnalysis(prompt, geminiApiKey)
    aiAnalysis = result.text
    usedModel = result.model
  } catch (err) {
    return jsonResponse({
      error: 'Falha na geração IA',
      detail: String(err),
      model: GEMINI_MODEL,
    }, 502)
  }

  const { error: updateError } = await supabase
    .from('responses')
    .update({ ai_analysis: aiAnalysis })
    .eq('id', responseId)

  if (updateError) {
    return jsonResponse({ error: 'Erro ao salvar análise' }, 500)
  }

  // 🔔 NOTIFY ADMIN (best effort, não bloqueia fluxo)
  try {
    console.log('Chamando notify-admin...')

    const notifyRes = await fetch(notifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ responseId }),
    })

    const text = await notifyRes.text()

    console.log('notify-admin status:', notifyRes.status)
    console.log('notify-admin response:', text)
  } catch (err) {
    console.error('Erro notify-admin (não crítico):', err)
  }

  return jsonResponse({ success: true, model: usedModel })
})
