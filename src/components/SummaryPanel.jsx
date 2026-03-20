import React, { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, FlaskConical, FileText, ShieldAlert } from 'lucide-react'

function CitationBadge({ index, type }) {
  const isPubMed = type === 'PubMed'
  const badgeClass = isPubMed ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
  return (
    <span className={'inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ' + badgeClass}>
      {isPubMed ? <FlaskConical className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
      [{index}] {type}
    </span>
  )
}

function CitationCard({ citation }) {
  return (
    <div className="card p-4 border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <CitationBadge index={citation.index} type={citation.type} />
            <span className="text-xs text-neutral-500">{citation.authors}</span>
          </div>
          <p className="font-semibold text-sm text-neutral-900 mb-2">
            <a href={citation.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
              {citation.title}
            </a>
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {citation.contribution}
          </p>
        </div>
        <a href={citation.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-neutral-400 hover:text-primary-600 transition-colors mt-1" aria-label="Open source">
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}

export default function SummaryPanel({ summary }) {
  const [citationsOpen, setCitationsOpen] = useState(true)

  if (!summary) return null

  const { conclusion, supportingSourceCount, citations, disclaimer } = summary
  const safeCitations = citations || []
  const pubmedCount = safeCitations.filter((c) => c.type === 'PubMed').length
  const trialCount = safeCitations.filter((c) => c.type === 'ClinicalTrial').length

  return (
    <div className="mb-8 space-y-4">

      <div className="card p-5 bg-primary-50 border border-primary-200">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center mt-0.5">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="font-bold text-neutral-900">Evidence Summary</h2>
              {supportingSourceCount > 0 && (
                <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full">
                  {supportingSourceCount} supporting {supportingSourceCount === 1 ? 'source' : 'sources'}
                </span>
              )}
            </div>
            <p className="text-neutral-800 leading-relaxed">{conclusion}</p>
          </div>
        </div>
      </div>

      {safeCitations.length > 0 && (
        <div>
          <button onClick={() => setCitationsOpen((o) => !o)} className="w-full card p-4 text-left hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {pubmedCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FlaskConical className="w-3 h-3" />
                      {pubmedCount} PubMed
                    </span>
                  )}
                  {trialCount > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {trialCount} Clinical {trialCount === 1 ? 'Trial' : 'Trials'}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-neutral-900">Cited References</span>
              </div>
              {citationsOpen ? <ChevronUp className="w-5 h-5 text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
            </div>
          </button>

          {citationsOpen && (
            <div className="space-y-3 mt-3">
              {safeCitations.map((citation) => (
                <CitationCard key={citation.index} citation={citation} />
              ))}
            </div>
          )}
        </div>
      )}

      {disclaimer && (
        <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">{disclaimer}</p>
        </div>
      )}

    </div>
  )
}
