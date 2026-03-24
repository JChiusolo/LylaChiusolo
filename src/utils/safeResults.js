/**
 * Guarantees results is always { pubmed: [], clinical_trials: [] }
 * with every value being a plain array. Paste this anywhere the
 * raw API response is touched.
 */
export function safeResults(raw) {
  if (!raw || typeof raw !== 'object') return { pubmed: [], clinical_trials: [] }
  const map = { clinicalTrials: 'clinical_trials', clinical_trials: 'clinical_trials', pubmed: 'pubmed' }
  const out = { pubmed: [], clinical_trials: [] }
  for (const [k, v] of Object.entries(raw)) {
    const key = map[k] ?? k
    out[key] = Array.isArray(v) ? v : []
  }
  return out
}
