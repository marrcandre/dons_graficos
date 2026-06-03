const DEFAULT_QUERY_TIMEOUT_MS = 10000

export async function runSupabaseQuery(query, timeoutMs = DEFAULT_QUERY_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await query.abortSignal(controller.signal)
  } finally {
    clearTimeout(timeout)
  }
}
