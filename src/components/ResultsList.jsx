import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import ResultCard from './ResultCard'

const SOURCE_LABELS = {
  pubmed:          { name: 'PubMed',          icon: '🔬', color: 'bg-blue-100'    },
  clinical_trials: { name: 'Clinical Trials',  icon: '⚕️', color: 'bg-green-100'  },
}
const FALLBACK_LABEL = { name: 'Results', icon: '📄', color: 'bg-neutral-100' }

export default function ResultsList({ results }) {
  // Do NOT derive initial state from props in useState() —
  // that expression only runs once on mount and goes stale.
  // useEffect keeps expanded in sync whenever results change.
  const [expanded, setExpanded] = useState(new Set())

  useEffect(() => {
    const openKeys = Object.entries(results)
      .filter(([, arr]) => Array.isArray(arr) && arr.length > 0)
      .map(([key]) => key)
    setExpanded(new Set(openKeys))
  }, [results])

  const toggle = (source) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(source) ? next.delete(source) : next.add(source)
      return next
    })
  }

  // Only render sources that actually have array results with items
  const visibleSources = Object.entries(results).filter(
    ([, arr]) => Array.isArray(arr) && arr.length > 0
  )

  const totalResults = visibleSources.reduce((sum, [, arr]) => sum + arr.length, 0)

  if (visibleSources.length === 0) return null

  return (
    <div>
      <div className="mb-6 card p-4 bg-primary-50">
        <h3 className="font-semibold text-neutral-900">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''}
        </h3>
      </div>

      {visibleSources.map(([source, articles]) => {
        const info = SOURCE_LABELS[source] ?? { ...FALLBACK_LABEL, name: source }

        return (
          <div key={source} className="mb-4">
            <button
              onClick={() => toggle(source)}
              className="w-full card p-4 text-left hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-2xl ${info.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
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
                  className={`w-5 h-5 transition-transform ${expanded.has(source) ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {expanded.has(source) && (
              <div className="space-y-3 mt-3">
                {articles.map((article, idx) => (
                  <ResultCard
                    key={article.id ?? idx}
                    article={article}
                    source={source}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
