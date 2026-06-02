import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY não configurada' }), { status: 500 })
  }

  // Verificar se o chamador é admin
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401 })
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userRow?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Acesso restrito a administradores' }), { status: 403 })
  }

  // Buscar dados da resposta
  let responseId: string
  try {
    const body = await req.json()
    responseId = body.responseId
    if (!responseId) throw new Error('responseId obrigatório')
  } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), { status: 400 })
  }

  const { data: response, error: fetchError } = await supabase
    .from('responses')
    .select('id, name, email, scores, ai_analysis, email_sent')
    .eq('id', responseId)
    .single()

  if (fetchError || !response) {
    return new Response(JSON.stringify({ error: 'Resposta não encontrada' }), { status: 404 })
  }

  if (response.email_sent) {
    return new Response(JSON.stringify({ error: 'Email já enviado para esta resposta' }), { status: 409 })
  }

  if (!response.email) {
    return new Response(JSON.stringify({ error: 'Destinatário não possui email cadastrado' }), { status: 422 })
  }

  const appUrl = Deno.env.get('APP_URL') ?? 'https://dons-espirituais.vercel.app'
  const resultsUrl = `${appUrl}/results/${responseId}`
  const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'marcoandre@gmail.com'
  const emailFrom = Deno.env.get('EMAIL_FROM') ?? 'dons@dons-espirituais.vercel.app'

  const aiSection = response.ai_analysis
    ? `<hr style="margin:24px 0">
       <h3>Reflexão sobre seus dons</h3>
       <p style="white-space:pre-wrap;line-height:1.7">${response.ai_analysis}</p>
       <hr style="margin:24px 0">`
    : ''

  const htmlBody = `
    <p>Olá, <strong>${response.name}</strong>!</p>

    <p>Aqui está o resultado do seu teste de dons espirituais.</p>

    <p>Analise principalmente os dons que aparecem com pontuação maior. Veja quais você
    já tinha certeza e também aqueles que te surpreenderam ou te deixaram dúvidas.
    Releia a definição de cada um dos dons, se for necessário. E aí, fez sentido pra você?</p>

    <p>É importante analisar seu gráfico com seu líder de grupo pequeno ou de ministério.
    Compartilhe também com cristãos da sua família em quem você confia — como seu marido,
    esposa, pais ou irmãos. Isso pode te ajudar a discernir com mais clareza a forma como
    Deus já tem usado você e como ainda quer usar.</p>

    ${aiSection}

    <p><a href="${resultsUrl}" style="background:#1B5438;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">
      Ver resultado completo ›
    </a></p>

    <p><strong>Links importantes:</strong></p>
    <ul>
      <li><a href="https://tinyurl.com/57y3mw83">Descrição detalhada de cada dom</a></li>
      <li><a href="https://tinyurl.com/5xmzbz9s">Material completo sobre o Espírito Santo</a></li>
      <li><a href="https://tinyurl.com/pepsapmt">Curso em vídeo</a></li>
    </ul>

    <p>Em Cristo,<br><strong>Marco André</strong></p>
  `

  // Enviar para o usuário
  const sendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailFrom,
      to: response.email,
      cc: adminEmail,
      subject: 'Seu resultado: Dons Espirituais',
      html: htmlBody,
    }),
  })

  if (!sendRes.ok) {
    const err = await sendRes.text()
    console.error('Erro Resend:', err)
    return new Response(JSON.stringify({ error: 'Falha ao enviar email' }), { status: 502 })
  }

  // Marcar como enviado
  await supabase
    .from('responses')
    .update({ email_sent: true })
    .eq('id', responseId)

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
