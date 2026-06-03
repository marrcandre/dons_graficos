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

DIRETRIZ CRÍTICA DE TAMANHO: Sua análise COMPLETA deve ser concisa e ter no máximo 2300 a 2500 caracteres (incluindo espaços). O texto impresso precisa caber estritamente em uma única página de PDF. Seja direto, profundo e evite repetições ou introduções longas.

${name} realizou o teste de dons espirituais. Resultados (escala 0–15 por dom, ordenados do maior para o menor):

${scoresFormatted}

Analise o resultado considerando:
1. Faça um resumo geral do perfil de ${name}.
2. Identifique os dons predominantes e explique o significado de cada um.
3. Aponte os possíveis pontos fortes do ministério dessa pessoa.
4. Indique desafios e cuidados que deve observar.
5. Sugira áreas de serviço e ministérios onde poderá ser mais frutífera.
6. Explique como os dons principais podem trabalhar em conjunto.
7. Apresente orientações práticas para o desenvolvimento espiritual e ministerial.
8. Escreva em linguagem encorajadora, equilibrada e pastoral (porém impessoal, sem se referir a si mesmo), dirigindo-se a ${name} diretamente usando "você".
9. Evite determinismo — lembre que o teste é uma ferramenta de autoconhecimento e deve ser confirmado pela prática, pelo testemunho da igreja e pela direção do Espírito Santo.

REGRAS DE FORMATAÇÃO E RESTRICÃO DE ESPAÇO:
- O texto deve ser escrito em prosa corrida, sem títulos, sem subtítulos e sem marcadores (bullets).
- O texto deve ter obrigatoriamente entre 4 e 5 parágrafos curtos e objetivos.
- Finalize o último parágrafo com um único versículo bíblico relevante.
- LEMBRE-SE: Respeite o limite estrito de espaço. Monitorize o tamanho para não ultrapassar 2500 caracteres de forma alguma.`;
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
      const geminiRes = await fetchWithTimeout(
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

      if (!geminiRes.ok) {
        const err = await geminiRes.text()
        const error = new Error(`Gemini API error (${geminiRes.status}) using ${model}: ${err}`)
        if (geminiRes.status === 429 || geminiRes.status === 503) {
          lastError = error
          console.error(error)
          continue
        }
        throw error
      }

      const geminiData = await geminiRes.json()
      const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error(`Gemini retornou conteúdo vazio usando ${model}`)
      return { text, model }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Falha desconhecida na geração IA')
      if (lastError.name === 'AbortError') {
        console.error(`Timeout ao chamar Gemini usando ${model}:`, lastError)
        continue
      }
      throw lastError
    }
  }

  throw lastError ?? new Error('Nenhum modelo Gemini disponível')
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
  if (!geminiApiKey) {
    return jsonResponse({ error: 'GEMINI_API_KEY não configurada' }, 500)
  }

  const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'marcoandre@gmail.com'
  const resendApiKey = Deno.env.get('RESEND_API_KEY')

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

  // Buscar resposta
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

  // Gerar análise via Gemini
  const scoresFormatted = formatScores(response.scores)
  const prompt = buildPrompt(response.name, scoresFormatted)

  let aiAnalysis: string
  let usedModel = GEMINI_MODEL
  try {
    const result = await generateGeminiAnalysis(prompt, geminiApiKey)
    aiAnalysis = result.text
    usedModel = result.model
  } catch (err) {
    console.error('Erro ao chamar Gemini:', err)
    const message = err instanceof Error && err.name === 'AbortError'
      ? `A chamada ao Gemini excedeu ${GEMINI_TIMEOUT_MS / 1000}s`
      : err instanceof Error ? err.message : 'Falha desconhecida na geração IA'
    return jsonResponse({ error: 'Falha na geração IA', detail: message, model: GEMINI_MODEL, fallbacks: GEMINI_FALLBACK_MODELS }, 502)
  }

  // Salvar análise no banco
  const { error: updateError } = await supabase
    .from('responses')
    .update({ ai_analysis: aiAnalysis })
    .eq('id', responseId)

  if (updateError) {
    console.error('Erro ao salvar ai_analysis:', updateError)
    return jsonResponse({ error: 'Erro ao salvar análise' }, 500)
  }

  // Enviar email de notificação para o admin (best-effort)
  if (resendApiKey) {
    const appUrl = Deno.env.get('APP_URL') ?? 'https://dons-espirituais.vercel.app'
    const resultsUrl = `${appUrl}/results/${responseId}`

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('EMAIL_FROM') ?? 'dons@dons-espirituais.vercel.app',
        to: adminEmail,
        subject: `[Dons] Novo teste: ${response.name}`,
        html: `<p>Novo teste finalizado:</p>
          <ul>
            <li><strong>Nome:</strong> ${response.name}</li>
            <li><strong>Email:</strong> ${response.email ?? 'não informado'}</li>
            <li><strong>GP:</strong> ${response.gp ?? '—'}</li>
            <li><strong>Idade:</strong> ${response.age ?? '—'}</li>
          </ul>
          <p><a href="${resultsUrl}">Ver resultado e análise IA ›</a></p>`,
      }),
    }).catch((e) => console.error('Erro ao notificar admin:', e))
  }

  return jsonResponse({ success: true, model: usedModel })
})
