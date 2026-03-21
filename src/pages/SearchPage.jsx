import React, { useState } from 'react'
import { Search, Loader } from 'lucide-react'
import SearchFilters from '../components/SearchFilters'
import ResultsList from '../components/ResultsList'
import SummaryPanel from '../components/SummaryPanel'
import useSearch from '../hooks/useSearch'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ sources: ['pubmed', 'clinical_trials'], maxResults: 10 })
  const { results, summary, loading, error, search } = useSearch()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) search(query, filters)
  }

  const hasResults = Object.keys(results).length > 0

  return (
    <div className="container-max py-8">
      <h1 className="text-4xl font-bold text-neutral-900 mb-8">Medical Information Search</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <SearchFilters filters={filters} onFilterChange={setFilters} />
        </div>

        <div className="lg:col-span-3">
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search research..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input text-lg"
                autoFocus
              />
              <button type="submit" disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2">
                {loading ? <Loader className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6 text-primary-600" />}
              </button>
            </div>
          </form>

          {error && (
            <div className="card p-4 bg-red-50 border-red-200 text-red-800 mb-6">{error}</div>
          )}

          {loading && (
            <div className="space-y-4">
              {/* Summary skeleton */}
              <div className="card p-5 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-1/4" />
                    <div className="h-4 bg-neutral-200 rounded w-full" />
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  </div>
                </div>
              </div>
              {/* Results skeleton */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-neutral-200 rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {!loading && hasResults && (
            <>
              <SummaryPanel summary={summary} />
              <ResultsList results={results} />
            </>
          )}

          {!loading && query && !hasResults && !error && (
            <div className="card p-12 text-center">
              <h3 className="font-semibold text-neutral-900">No results found</h3>
              <p className="text-neutral-600 text-sm mt-1">Try adjusting your search query</p>
            </div>
          )}

          {!loading && !query && (
            <div className="card p-12 text-center bg-primary-50">
              <h3 className="font-semibold text-neutral-900">Enter a search query</h3>
              <p className="text-neutral-600 text-sm mt-1">Search across PubMed and Clinical Trials</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
