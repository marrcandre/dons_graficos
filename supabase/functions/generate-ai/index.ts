import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GIFTS_ORDER = [
  "Profecia",
  "Pastor",
  "Ensino",
  "Sabedoria",
  "Conhecimento",
  "Exortação",
  "Discernimento de Espíritos",
  "Contribuição",
  "Socorro",
  "Misericórdia",
  "Missionário",
  "Evangelista",
  "Hospitalidade",
  "Dom da Fé",
  "Liderança",
  "Administração",
  "Operação de Milagres",
  "Dons de Cura",
  "Línguas",
  "Interpretação de Línguas",
  "Pobreza Voluntária",
  "Celibato",
  "Intercessão",
  "Libertação",
  "Serviço",
  "Apóstolo",
  "Liderança de Adoração",
];

const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
const GEMINI_FALLBACK_MODELS = (
  Deno.env.get("GEMINI_FALLBACK_MODELS") ?? "gemini-2.5-flash-lite"
)
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);

const GEMINI_TIMEOUT_MS = Number(Deno.env.get("GEMINI_TIMEOUT_MS") ?? 25000);
const GEMINI_THINKING_BUDGET = Number(
  Deno.env.get("GEMINI_THINKING_BUDGET") ?? 0,
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function buildPrompt(name: string, scoresFormatted: string): string {
  return `Você é um especialista em dons espirituais segundo o modelo de C. Peter Wagner, com ampla experiência em discipulado, desenvolvimento ministerial e orientação cristã.

Sua tarefa é analisar os resultados de um teste de dons espirituais e produzir uma análise leve, pessoal, calorosa e perspicaz — como se fosse um conselheiro espiritual de confiança conversando com a pessoa.

ESTILO E TOM:

- Escreva em português do Brasil.
- Use o nome da pessoa ao longo do texto, de forma natural e personalizada.
- Adote um tom caloroso, encorajador e direto — como uma conversa pastoral, não um relatório formal.
- Use emojis com moderação para tornar o texto visualmente agradável e de fácil leitura.
- Evite linguagem excessivamente técnica, burocrática ou corporativa.
- Seja conciso: prefira frases curtas e parágrafos enxutos.
- Não repita as mesmas ideias em seções diferentes.
- Não faça menções ao funcionamento interno da IA.
- Não utilize nenhuma formatação de texto: sem negrito, sem itálico, sem listas numeradas ou com marcadores, sem markdown de qualquer tipo.
- Se quiser destacar algo, use CAIXA ALTA com moderação.

SOBRE OS DADOS:

- Considere o perfil completo, não apenas os 3 primeiros dons.
- Identifique padrões temáticos no conjunto dos dons (ex: perfil pastoral, sobrenatural, ensino, liderança, serviço, etc.).
- Mencione dons que se destacam por suas pontuações, especialmente acima de 10 ou iguais a 15.
- Agrupe dons relacionados quando fizer sentido (ex: Línguas e Interpretação; Milagres e Cura; Profecia e Discernimento).
- Não mencione pontuações numéricas no corpo do texto.

ESTRUTURA SUGERIDA (adapte conforme o perfil — não precisa ser rígida):

1. Abertura pessoal: 1 parágrafo resumindo o perfil geral da pessoa de forma calorosa e direta.

2. 🎯 Top dons: Liste de 4 a 6 dons com maior expressão, usando um emoji temático por dom, nome em negrito e uma frase curta e direta explicando o dom no contexto desse perfil.

3. ✨ Dons sobrenaturais (se aplicável): Agrupe os dons sobrenaturais presentes (Profecia, Milagres, Cura, Discernimento, Línguas, Interpretação) e comente brevemente sobre o que isso indica espiritualmente.

4. 💡 Outros dons com expressão relevante: mencione brevemente outros dons com pontuação alta que complementam o perfil.

5. 🏠 Aplicação prática: 1 parágrafo sugerindo como esses dons podem ser usados na comunidade ou no GP.

6. 🔥 Resumo final: 1 parágrafo curto e encorajador, pessoal, direto, com uma chamada à ação espiritual.

IMPORTANTE:
- Se a pessoa tiver muitos dons com pontuação alta, destaque o que há de mais singular ou incomum no perfil dela.
- Não crie seções que não façam sentido para o perfil (ex: se não há dons sobrenaturais relevantes, omita essa seção).
- Mantenha o texto fluido, sem parecer um formulário preenchido.

Dados do participante:

Nome: ${name}

Resultados completos (ordenados do maior para o menor):
${scoresFormatted}

`;
}

function formatScores(scores: Record<string, number>): string {
  return GIFTS_ORDER.map((name, id) => ({ name, score: scores[id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .map(({ name, score }) => `${name}: ${score}/15`)
    .join("\n");
}

async function generateGeminiAnalysis(prompt: string, apiKey: string) {
  const models = [GEMINI_MODEL, ...GEMINI_FALLBACK_MODELS];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const res = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      );

      if (!res.ok) {
        const errText = await res.text();

        console.error(`Gemini erro usando ${model}`, res.status, errText);

        const err = new Error(
          `Gemini error (${res.status}) using ${model}: ${errText}`,
        );

        if (res.status === 429 || res.status === 503) {
          lastError = err;
          console.warn(err.message);
          continue;
        }

        throw err;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      if (!text) throw new Error(`Resposta vazia Gemini (${model})`);

      return { text, model };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Erro desconhecido");

      if (lastError.name === "AbortError") {
        console.warn(`Timeout Gemini (${model})`);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError ?? new Error("Nenhum modelo disponível");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  const notifyUrl = `${supabaseUrl}/functions/v1/notify-admin`;

  if (!geminiApiKey) {
    return jsonResponse({ error: "GEMINI_API_KEY não configurada" }, 500);
  }

  let responseId: string;
  let force = false;

  try {
    const body = await req.json();
    responseId = body.responseId;
    force = body.force === true;
    if (!responseId) throw new Error("responseId obrigatório");
  } catch {
    return jsonResponse({ error: "Body inválido" }, 400);
  }

  const { data: response, error: fetchError } = await supabase
    .from("responses")
    .select("id, name, email, gp, age, scores, ai_analysis")
    .eq("id", responseId)
    .single();

  if (fetchError || !response) {
    return jsonResponse({ error: "Resposta não encontrada" }, 404);
  }

  if (response.ai_analysis && !force) {
    return jsonResponse({ success: true, skipped: true });
  }

  const scoresFormatted = formatScores(response.scores);
  const prompt = buildPrompt(response.name, scoresFormatted);

  let aiAnalysis: string;
  let usedModel = GEMINI_MODEL;

  try {
    const result = await generateGeminiAnalysis(prompt, geminiApiKey);
    aiAnalysis = result.text;
    usedModel = result.model;
  } catch (err) {
    console.error("ERRO GERAÇÃO IA:", err);

    return jsonResponse(
      {
        error: "Falha na geração IA",
        detail: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : null,
        model: GEMINI_MODEL,
      },
      502,
    );
  }

  const { error: updateError } = await supabase
    .from("responses")
    .update({ ai_analysis: aiAnalysis })
    .eq("id", responseId);

  if (updateError) {
    return jsonResponse({ error: "Erro ao salvar análise" }, 500);
  }

  // 🔔 NOTIFY ADMIN (best effort, não bloqueia fluxo)
  try {
    console.log("Chamando notify-admin...");

    const notifyRes = await fetch(notifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseServiceRoleKey,
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
      },
      body: JSON.stringify({ responseId }),
    });

    const text = await notifyRes.text();

    console.log("notify-admin status:", notifyRes.status);
    console.log("notify-admin response:", text);
  } catch (err) {
    console.error("Erro notify-admin (não crítico):", err);
  }

  return jsonResponse({ success: true, model: usedModel });
});
