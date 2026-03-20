import { useState } from 'react'
import axios from 'axios'

export default function useSearch() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const search = async (query, filters) => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('/api/search', {
        question: query,
      })
      setResults(response.data.results || {})
    } catch (err) {
      setError(err.message || 'Search failed')
      setResults({})
    } finally {
      setLoading(false)
    }
  }

  return { results, loading, error, search }
}
