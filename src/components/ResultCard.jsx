import React, { useState } from 'react'
import { ExternalLink, ChevronDown, Calendar, Users, Activity, Pill } from 'lucide-react'

export default function ResultCard({ article, source }) {
  const [expanded, setExpanded] = useState(false)

  const isPubMed = source === 'pubmed'
  const isTrial  = source === 'clinical_trials'

  const badgeColor = isPubMed
    ? 'bg-blue-100 text-blue-800'
    : 'bg-green-100 text-green-800'

  const bodyText    = article.summary ?? article.abstract ?? null
  const displayDate = isPubMed ? article.pubDate : article.startDate

  const authorText = Array.isArray(article.authors) && article.authors.length > 0
    ? article.authors.slice(0, 3).join(', ')
    : null

  const conditions    = Array.isArray(article.conditions)    ? article.conditions.slice(0, 3)    : []
  const interventions = Array.isArray(article.interventions) ? article.interventions.slice(0, 3) : []

  const identifier = isPubMed ? `PMID: ${article.id}` : `NCT: ${article.id}`

  const viewLink = article.url
    ? React.createElement(
        'a',
        {
          href: article.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'text-primary-600 text-sm flex items-center gap-1 hover:underline',
        },
        'View ',
        React.createElement(ExternalLink, { className: 'w-4 h-4' })
      )
    : null

  return (
    <div className="card hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-lg font-semibold text-neutral-900 leading-snug">{article.title}</h3>
          <span className={`badge shrink-0 ${badgeColor}`}>{isPubMed ? 'PubMed' : 'Trial'}</span>
        </div>

        {bodyText && (
          <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{bodyText}</p>
        )}

        <div className="space-y-1 mb-4 text-sm text-neutral-600">
          {isPubMed && authorText && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 shrink-0" />
              <span>{authorText}</span>
            </div>
          )}
          {isPubMed && article.journal && (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 shrink-0" />
              <span className="italic">{article.journal}</span>
            </div>
          )}
          {displayDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{displayDate}</span>
            </div>
          )}
          {isTrial && article.status && (
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 shrink-0" />
              <span className={`font-medium ${article.status === 'RECRUITING' ? 'text-green-700' : 'text-neutral-600'}`}>
                {article.status}
              </span>
            </div>
          )}
          {isTrial && conditions.length > 0 && (
            <div className="flex items-start gap-2">
              <Pill className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{conditions.join(', ')}</span>
            </div>
          )}
          {isTrial && interventions.length > 0 && (
            <div className="flex items-start gap-2">
              <Pill className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="text-neutral-500">{interventions.join(', ')}</span>
            </div>
          )}
        </div>

        {bodyText && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary-600 text-sm font-medium flex items-center gap-1"
          >
            {expanded ? 'Less' : 'More'}
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {expanded && bodyText && (
        <div className="border-t border-neutral-200 p-5 bg-neutral-50">
          <p className="text-sm text-neutral-700 leading-relaxed">{bodyText}</p>
        </div>
      )}

      <div className="border-t border-neutral-200 px-5 py-3 bg-neutral-50 flex justify-between items-center">
        <span className="text-xs text-neutral-500">{identifier}</span>
        {viewLink}
      </div>
    </div>
  )
}
