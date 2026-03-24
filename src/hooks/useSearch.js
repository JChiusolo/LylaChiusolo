import { useState, useCallback } from 'react'
import axios from 'axios'

function toArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (Array.isArray(value.hits)) return value.hits
  if (Array.isArray(value.results)) return value.results
  if (Array.isArray(value.articles)) return value.articles
  if (Array.isArray(value.studies)) return value.studies
  if (typeof value === 'object') return [value]
  return []
}

function normalizeResults(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const KEY_MAP = {
    clinicalTrials: 'clinical_trials',
    clinical_trials: 'clinical_trials',
    pubmed: 'pubmed',
  }
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [KEY_MAP[key] ?? key, toArray(value)])
  )
}

export default function useSearch() {
  const [results, setResults] = useState({})
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = useCallback(async (query, filters) => {
    setLoading(true)
    setError(null)
    setResults({})
    setSummary(null)
    try {
      const response = await axios.post('/api/search', { question: query, filters })
      const data = response.data
      setResults(normalizeResults(data?.results))
      setSummary(data?.summary ?? null)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Search failed')
      setResults({})
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, summary, loading, error, search }
}
