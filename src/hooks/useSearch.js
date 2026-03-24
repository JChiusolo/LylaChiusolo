import { useState, useCallback } from 'react'
import axios from 'axios'

/**
 * Normalize a single source's result value to always be an array.
 * Handles: array (pass-through), object with hits/results/articles key, null/undefined.
 */
function normalizeSourceResults(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  // Common API envelope shapes
  if (Array.isArray(value.hits))     return value.hits
  if (Array.isArray(value.results))  return value.results
  if (Array.isArray(value.articles)) return value.articles
  if (Array.isArray(value.studies))  return value.studies
  // Last resort: wrap a single object result
  if (typeof value === 'object') return [value]
  return []
}

/**
 * Normalize the full results map so every value is an array.
 */
function normalizeResults(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return Object.fromEntries(
    Object.entries(raw).map(([source, value]) => [source, normalizeSourceResults(value)])
  )
}

export default function useSearch() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // useCallback prevents a new function reference on every render,
  // which was causing the infinite re-render loop when search was
  // used as a dependency anywhere in the render tree.
  const search = useCallback(async (query, filters) => {
    setLoading(true)
    setError(null)
    setResults({})

    try {
      const response = await axios.post('/api/search', {
        question: query,
        filters,
      })
      const normalized = normalizeResults(response.data?.results)
      setResults(normalized)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Search failed')
      setResults({})
    } finally {
      setLoading(false)
    }
  }, []) // no deps — setters from useState are stable references

  return { results, loading, error, search }
}
