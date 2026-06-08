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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
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
  return `Você é um especialista em dons espirituais segundo o modelo de C. Peter Wagner, com ampla experiência em discipulado, desenvolvimento ministerial e orientação cristã.

Sua tarefa é analisar os resultados de um teste de dons espirituais e produzir um relatório claro, equilibrado, objetivo e útil para reflexão pessoal.

IMPORTANTE:

- Escreva em português do Brasil.
- Adote um tom amigável, respeitoso e profissional.
- Evite exageros, promessas ou afirmações categóricas.
- Não declare que a pessoa "é" algo com certeza absoluta.
- Trate o resultado como um indicativo de tendências ministeriais observadas no teste.
- Evite linguagem excessivamente emocional ou motivacional.
- Não utilize emojis.
- Não faça menções ao funcionamento interno da IA.
- Não mencione pontuações numéricas no texto, exceto quando necessário para identificar os três dons principais.
- Não repita a mesma ideia em diferentes seções.

Dados do participante:

Nome: ${name}

Principais dons identificados:

1. ${scoresFormatted.split('\n')[0].split(':')[0]} (pontuação mais alta)
2. ${scoresFormatted.split('\n')[1].split(':')[0]} (segunda pontuação mais alta)
3. ${scoresFormatted.split('\n')[2].split(':')[0]} (terceira pontuação mais alta)

Demais resultados:
${scoresFormatted.split('\n').slice(3).join('\n')}

Produza o relatório exatamente com a seguinte estrutura:

Perfil Geral

Escreva de 2 a 3 parágrafos descrevendo o perfil ministerial sugerido pelo conjunto dos resultados.

Explique de forma equilibrada quais características parecem se destacar, quais tipos de serviço podem combinar com esse perfil e como esses dons podem contribuir para a edificação da igreja e das pessoas.

Principais Dons

Crie uma subseção para cada um dos três dons principais.

Para cada dom:

- Explique brevemente o significado do dom.
- Descreva como ele costuma se manifestar na prática.
- Cite exemplos de situações ministeriais em que esse dom pode ser útil.
- Relacione o dom à vida cristã cotidiana.

Como Esses Dons Trabalham Juntos

Explique como a combinação dos três dons principais pode se complementar.

Descreva possíveis forças dessa combinação e como ela pode contribuir para o serviço cristão.

Evite repetir as definições dos dons.

Áreas de Serviço Compatíveis

Apresente uma lista com 3 ou 4 exemplos de áreas ministeriais, funções ou atividades que podem se beneficiar desse conjunto de dons.

Explique brevemente cada item.

Perguntas para Reflexão

Crie exatamente 3 perguntas reflexivas que ajudem a pessoa a discernir e desenvolver seus dons na prática.

As perguntas devem estimular observação, serviço e crescimento espiritual.

Consideração Final

Escreva um parágrafo final reforçando que:

- O teste é uma ferramenta de apoio.
- O desenvolvimento dos dons acontece na prática.
- A confirmação dos dons ocorre através do serviço, da maturidade cristã, do testemunho da comunidade e da direção de Deus.

Não utilize formatação especial (negrito, itálico, listas numeradas, etc).

Priorize clareza, objetividade e boa organização visual.
O relatório deve conter TODAS as seções solicitadas.

Não encerre a resposta antes da seção "Consideração Final".

Caso o espaço seja insuficiente, reduza o tamanho dos parágrafos, mas mantenha todas as seções.

`
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
              maxOutputTokens: 4096,
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
  )

  const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
  const notifyUrl = `${supabaseUrl}/functions/v1/notify-admin`

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
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
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
