import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import fetch from 'node-fetch'

// Carrega .env do diretório raiz se as variáveis não estiverem no ambiente
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const envPath = path.resolve(__dirname, '../.env')
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '')
        if (key && !key.startsWith('#')) {
          process.env[key] = value
        }
      }
    })
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing env vars: certifique-se de configurar o arquivo .env na raiz do projeto.')
  process.exit(1)
}

async function getResponsesWithoutAI() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/responses?select=id,name&ai_analysis=is.null`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Falha ao buscar respostas (${res.status}): ${errText}`)
  }

  return await res.json()
}

async function generateAI(responseId) {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/generate-ai`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ responseId, force: true }),
    }
  )

  const data = await res.json()
  return data
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function run() {
  console.log('Buscando respostas sem IA...')

  try {
    const responses = await getResponsesWithoutAI()

    if (!Array.isArray(responses)) {
      throw new Error('Retorno da API não é um array válido')
    }

    console.log(`Encontradas ${responses.length} respostas`)

    for (let i = 0; i < responses.length; i++) {
      const r = responses[i]

      console.log(`Processando ${i + 1}/${responses.length}: ${r.name} (${r.id})`)

      try {
        const result = await generateAI(r.id)
        if (result && result.error) {
          console.error(`Erro no processamento (${r.id}):`, result.error, result.detail || '')
        } else {
          console.log('OK:', result)
        }
      } catch (err) {
        console.error(`Erro na requisição da resposta (${r.id}):`, err)
      }

      // delay para não estourar Gemini
      await sleep(3000)
    }

    console.log('Finalizado')
  } catch (err) {
    console.error('Erro na execução do backfill:', err)
  }
}

run()
