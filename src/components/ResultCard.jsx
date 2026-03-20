import React, { useState } from 'react'
import { ExternalLink, ChevronDown, Calendar, Users } from 'lucide-react'

export default function ResultCard({ article, source }) {
  const [expanded, setExpanded] = useState(false)

  const isPubMed = source === 'pubmed'
  const badgeColor = isPubMed ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
  const badgeClass = 'badge ' + badgeColor
  const authorDisplay = article.authors ? article.authors.slice(0, 2).join(', ') : ''
  const dateDisplay = article.pubDate || article.startDate || null
  const bodyText = article.summary || null
  const idLabel = isPubMed ? 'PMID: ' + article.id : 'NCT: ' + article.id
  const chevronClass = expanded ? 'w-4 h-4 rotate-180' : 'w-4 h-4'
  const statusClass = article.status === 'RECRUITING'
    ? 'text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700'
    : article.status === 'COMPLETED'
    ? 'text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700'
    : 'text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700'

  return (
    <div className="card hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-lg font-semibold text-neutral-900">{article.title}</h3>
          <span className={badgeClass}>{isPubMed ? 'PubMed' : 'Trial'}</span>
        </div>

        {bodyText && (
          <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{bodyText}</p>
        )}

        <div className="space-y-1 mb-4 text-sm text-neutral-600">
          {isPubMed && authorDisplay && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{authorDisplay}</span>
            </div>
          )}
          {!isPubMed && article.status && (
            <div className="flex items-center gap-2">
              <span className={statusClass}>{article.status}</span>
            </div>
          )}
          {dateDisplay && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{dateDisplay}</span>
            </div>
          )}
        </div>

        {bodyText && (
          <button onClick={() => setExpanded(!expanded)} className="text-primary-600 text-sm font-medium flex items-center gap-1">
            {expanded ? 'Less' : 'More'}
            <ChevronDown className={chevronClass} />
          </button>
        )}
      </div>

      {expanded && bodyText && (
        <div className="border-t border-neutral-200 p-5 bg-neutral-50">
          <p className="text-sm text-neutral-700">{bodyText}</p>
        </div>
      )}

      <div className="border-t border-neutral-200 px-5 py-3 bg-neutral-50 flex justify-between items-center">
        <span className="text-xs text-neutral-500">{idLabel}</span>
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm flex items-center gap-1">View <ExternalLink className="w-4 h-4" /></a>
      </div>
    </div>
  )
}
