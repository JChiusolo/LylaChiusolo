import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import ResultCard from './ResultCard'

const sourceLabels = {
  pubmed: { name: 'PubMed', icon: '🔬', color: 'bg-blue-100' },
  clinical_trials: { name: 'Clinical Trials', icon: '⚕️', color: 'bg-green-100' }
}

export default function ResultsList({ results }) {
  const [expanded, setExpanded] = useState(new Set(Object.keys(results).filter(k => results[k]?.length > 0)))

  const toggle = (source) => {
    const newExpanded = new Set(expanded)
    newExpanded.has(source) ? newExpanded.delete(source) : newExpanded.add(source)
    setExpanded(newExpanded)
  }

  const totalResults = Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0)

  return (
    <div>
      <div className="mb-6 card p-4 bg-primary-50">
        <h3 className="font-semibold text-neutral-900">Found {totalResults} results</h3>
      </div>

      {Object.entries(results)
        .filter(([_, articles]) => articles?.length > 0)
        .map(([source, articles]) => {
          const info = sourceLabels[source]
          return (
            <div key={source} className="mb-4">
              <button onClick={() => toggle(source)} className="w-full card p-4 text-left hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${info.color} w-10 h-10 rounded-lg flex items-center justify-center`}>{info.icon}</div>
                    <div>
                      <h3 className="font-bold">{info.name}</h3>
                      <p className="text-sm text-neutral-600">{articles.length} results</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expanded.has(source) ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expanded.has(source) && (
                <div className="space-y-3 mt-3">
                  {articles.map((article, idx) => (
                    <ResultCard key={idx} article={article} source={source} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}
