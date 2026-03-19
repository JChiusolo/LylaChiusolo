import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Zap, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-neutral-50">
        <div className="container-max max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-6">
            Research Search Made <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Simple</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            Search PubMed and Clinical Trials simultaneously. Find the research you need in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search" className="btn btn-primary">Start Searching</Link>
            <Link to="/docs" className="btn btn-outline">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-max">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-16">Why Lyla?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Fast Search', desc: 'Search both sources simultaneously' },
              { icon: Zap, title: 'Powerful', desc: 'Rich article metadata and details' },
              { icon: Globe, title: 'Comprehensive', desc: 'Millions of articles and trials' }
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="card p-6">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600 text-sm">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="container-max text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Research Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="card p-8">
              <div className="text-5xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">PubMed</h3>
              <p className="text-neutral-600 text-sm">NCBI biomedical literature database with millions of citations</p>
            </div>
            <div className="card p-8">
              <div className="text-5xl mb-4">⚕️</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Clinical Trials</h3>
              <p className="text-neutral-600 text-sm">ClinicalTrials.gov with recruitment status and trial information</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
