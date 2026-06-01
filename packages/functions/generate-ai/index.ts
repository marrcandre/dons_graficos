import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GIFTS_ORDER = [
  'Profecia', 'Pastor', 'Ensino', 'Sabedoria', 'Conhecimento', 'Exortação',
  'Discernimento de Espíritos', 'Contribuição', 'Socorro', 'Misericórdia',
  'Missionário', 'Evangelista', 'Hospitalidade', 'Dom da Fé', 'Liderança',
  'Administração', 'Operação de Milagres', 'Dons de Cura', 'Línguas',
  'Interpretação de Línguas', 'Pobreza Voluntária', 'Celibato', 'Intercessão',
  'Libertação', 'Serviço', 'Apóstolo', 'Liderança de Adoração',
]

function buildPrompt(name: string, scoresFormatted: string): string {
  return `Você é um pastor evangélico experiente em dons espirituais conforme o modelo de Peter Wagner (livro "Descubra Seus Dons Espirituais").

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
8. Escreva em linguagem encorajadora, equilibrada e pastoral, dirigindo-se a ${name} diretamente usando "você".
9. Evite determinismo — lembre que o teste é uma ferramenta de autoconhecimento e deve ser confirmado pela prática, pelo testemunho da igreja e pela direção do Espírito Santo.

Formato: prosa corrida, sem títulos, sem marcadores, 4 a 6 parágrafos.
Finalize com um versículo bíblico relevante em destaque.`
}

function formatScores(scores: Record<string, number>): string {
  return GIFTS_ORDER
    .map((name, id) => ({ name, score: scores[id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .map(({ name, score }) => `${name}: ${score}/15`)
    .join('\n')
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
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada' }), { status: 500 })
  }

  const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'marcoandre@gmail.com'
  const resendApiKey = Deno.env.get('RESEND_API_KEY')

  let responseId: string
  try {
    const body = await req.json()
    responseId = body.responseId
    if (!responseId) throw new Error('responseId obrigatório')
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), { status: 400 })
  }

  // Buscar resposta
  const { data: response, error: fetchError } = await supabase
    .from('responses')
    .select('id, name, email, gp, age, scores, ai_analysis')
    .eq('id', responseId)
    .single()

  if (fetchError || !response) {
    return new Response(JSON.stringify({ error: 'Resposta não encontrada' }), { status: 404 })
  }

  // Gerar análise via Gemini 1.5 Flash
  const scoresFormatted = formatScores(response.scores)
  const prompt = buildPrompt(response.name, scoresFormatted)

  let aiAnalysis: string
  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      throw new Error(`Gemini API error: ${err}`)
    }

    const geminiData = await geminiRes.json()
    aiAnalysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    if (!aiAnalysis) throw new Error('Gemini retornou conteúdo vazio')
  } catch (err) {
    console.error('Erro ao chamar Gemini:', err)
    return new Response(JSON.stringify({ error: 'Falha na geração IA' }), { status: 502 })
  }

  // Salvar análise no banco
  const { error: updateError } = await supabase
    .from('responses')
    .update({ ai_analysis: aiAnalysis })
    .eq('id', responseId)

  if (updateError) {
    console.error('Erro ao salvar ai_analysis:', updateError)
    return new Response(JSON.stringify({ error: 'Erro ao salvar análise' }), { status: 500 })
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

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
