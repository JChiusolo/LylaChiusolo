import React from 'react'

export default function DocsPage() {
  return (
    <div className="container-max py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-neutral-900 mb-8">Documentation</h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Getting Started</h2>
          <div className="card p-8 space-y-4">
            <p className="text-neutral-700">Lyla searches two major research databases simultaneously.</p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <ol className="list-decimal list-inside space-y-2 text-primary-800 text-sm">
                <li>Go to the <a href="/search" className="font-semibold">Search</a> page</li>
                <li>Enter your research query</li>
                <li>Select sources (PubMed, Clinical Trials, or both)</li>
                <li>Browse results organized by source</li>
              </ol>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Research Sources</h2>
          <div className="space-y-4">
            {[
              { name: 'PubMed', desc: 'NCBI biomedical literature with 35M+ citations' },
              { name: 'Clinical Trials', desc: 'ClinicalTrials.gov database with 400K+ active trials' }
            ].map((src, i) => (
              <div key={i} className="card p-6">
                <h3 className="font-bold text-neutral-900 mb-2">{src.name}</h3>
                <p className="text-neutral-600">{src.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">API</h2>
          <div className="card p-6">
            <pre className="bg-neutral-100 p-4 rounded text-sm overflow-x-auto">
{`POST /api/search
{
  "query": "cancer treatment",
  "sources": ["pubmed", "clinical_trials"],
  "maxResults": 10
}`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  )
}
