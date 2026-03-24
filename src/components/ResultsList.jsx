import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import ResultCard from './ResultCard'

const sourceLabels = {
  pubmed:          { name: 'PubMed',          icon: '🔬', color: 'bg-blue-100'  },
  clinical_trials: { name: 'Clinical Trials',  icon: '⚕️', color: 'bg-green-100' },
}

const DEFAULT_LABEL = { name: 'Results', icon: '📄', color: 'bg-neutral-100' }

export default function ResultsList({ results }) {
  // Initialize to empty — useEffect below keeps this in sync with props.
  // Using useState(derivedFromProps) only runs once on mount, so it would
  // stay stale when results changed — replaced with useEffect pattern.
  const [expanded, setExpanded] = useState(new Set())

  useEffect(() => {
    // Auto-expand every source that has at least one result
    const sourcesWithResults = Object.keys(results).filter(
      (k) => Array.isArray(results[k]) && results[k].length > 0
    )
    setExpanded(new Set(sourcesWithResults))
  }, [results])

  const toggle = (source) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(source) ? next.delete(source) : next.add(source)
      return next
    })
  }

  const totalResults = Object.values(results).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  )

  const sourcesWithResults = Object.entries(results).filter(
    ([, articles]) => Array.isArray(articles) && articles.length > 0
  )

  if (sourcesWithResults.length === 0) return null

  return (
    <div>
      <div className="mb-6 card p-4 bg-primary-50">
        <h3 className="font-semibold text-neutral-900">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''}
        </h3>
      </div>

      {sourcesWithResults.map(([source, articles]) => {
        const info = sourceLabels[source] ?? { ...DEFAULT_LABEL, name: source }
        return (
          <div key={source} className="mb-4">
            <button
              onClick={() => toggle(source)}
              className="w-full card p-4 text-left hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`text-2xl ${info.color} w-10 h-10 rounded-lg flex items-center justify-center`}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="font-bold">{info.name}</h3>
                    <p className="text-sm text-neutral-600">
                      {articles.length} result{articles.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    expanded.has(source) ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {expanded.has(source) && (
              <div className="space-y-3 mt-3">
                {articles.map((article, idx) => (
                  <ResultCard key={article.id ?? idx} article={article} source={source} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
