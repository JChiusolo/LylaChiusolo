import React, { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, FlaskConical, FileText, ShieldAlert, Download } from 'lucide-react'

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

export default function SummaryPanel({ summary, topic = 'Research' }) {
  const [citationsOpen, setCitationsOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [accessToken, setAccessToken] = useState(null)

  if (!summary) return null

  const { conclusion, supportingSourceCount, citations, disclaimer } = summary
  const safeCitations = citations || []
  const pubmedCount = safeCitations.filter((c) => c.type === 'PubMed').length
  const trialCount = safeCitations.filter((c) => c.type === 'ClinicalTrial').length

  const handleSignIn = async () => {
    const clientId = '45893805451-5jj3mimasahbc9v1baegis10e19db2ps.apps.googleusercontent.com'
    const redirectUri = window.location.origin
    const scope = 'https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/drive'
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`
    
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    
    const popup = window.open(authUrl, 'google-login', `width=${width},height=${height},left=${left},top=${top}`)
    
    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup)
          return
        }
        
        if (popup.location.hash) {
          const hash = popup.location.hash.substring(1)
          const params = new URLSearchParams(hash)
          const token = params.get('access_token')
          
          if (token) {
            setAccessToken(token)
            setIsSignedIn(true)
            setError(null)
            popup.close()
            clearInterval(checkPopup)
          }
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    }, 500)
  }

  const handleExportToSlides = async () => {
    if (!isSignedIn || !accessToken) {
      setError('Please sign in to your Google account first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/.netlify/functions/create-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${topic || 'Research'} Summary`,
          summary: conclusion,
          citations: safeCitations,
          disclaimer: disclaimer,
          supportingSourceCount: supportingSourceCount,
          accessToken: accessToken,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create presentation: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.presentationUrl) {
        window.open(data.presentationUrl, '_blank')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error creating Google Slides:', errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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

      <div className="flex gap-2 flex-wrap">
        {!isSignedIn ? (
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            title="Sign in with Google to export to slides"
          >
            <Download className="w-4 h-4" />
            Sign in with Google
          </button>
        ) : (
          <button
            onClick={handleExportToSlides}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
            title="Export summary and citations to Google Slides"
          >
            <Download className="w-4 h-4" />
            {isLoading ? 'Creating presentation...' : 'Export to Google Slides'}
          </button>
        )}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
            <span>{error}</span>
          </div>
        )}
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
