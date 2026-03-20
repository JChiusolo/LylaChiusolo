import { useState } from 'react'
import axios from 'axios'

export default function useSearch() {
  const [results, setResults] = useState({})
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async (query, filters) => {
    setLoading(true)
    setError(null)
    setSummary(null)
    setResults({})

    try {
      const response = await axios.post('/api/search', {
        question: query,
        maxResults: filters?.maxResults ?? 10,
      })

      setResults(response.data.results || {})
      setSummary(response.data.summary || null)
    } catch (err) {
      setError(err.message || 'Search failed')
      setResults({})
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  return { results, summary, loading, error, search }
}
