import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, TrendingUp, Loader } from 'lucide-react';

class MedicalKeywordDetector {
  static DRUG_PATTERNS = {
    jardiance: { keywords: ['jardiance', 'empagliflozin', 'sglt2'], category: 'SGLT2 inhibitor' },
    mounjaro:  { keywords: ['mounjaro', 'tirzepatide', 'glp-1/gip', 'glp-1 gip'], category: 'Dual GLP-1/GIP Agonist' },
  };

  static TOPIC_PATTERNS = {
    adverseEvents: { keywords: ['adverse', 'side effect', 'safety', 'event', 'toxicity', 'tolerability'], priority: 'HIGH' },
    mechanism:     { keywords: ['mechanism', 'moa', 'how.*work', 'receptor', 'pathway', 'target'], priority: 'MEDIUM' },
    combination:   { keywords: ['combination', 'together', 'plus', 'dual', 'synerg'], priority: 'MEDIUM' },
    efficacy:      { keywords: ['efficacy', 'effectiveness', 'reduction', 'a1c', 'weight loss', 'outcome'], priority: 'LOW' },
  };

  static detectDrug(query) {
    const lower = query.toLowerCase();
    for (const [drugId, data] of Object.entries(this.DRUG_PATTERNS)) {
      if (data.keywords.some(kw => new RegExp(kw, 'i').test(lower))) {
        return { drugId, drugName: drugId.charAt(0).toUpperCase() + drugId.slice(1), category: data.category };
      }
    }
    return null;
  }

  static detectTopics(query) {
    const lower = query.toLowerCase();
    const found = [];
    for (const [topicId, data] of Object.entries(this.TOPIC_PATTERNS)) {
      if (data.keywords.some(kw => new RegExp(kw, 'i').test(lower))) {
        found.push({ topicId, displayName: topicId.replace(/([A-Z])/g, ' $1').trim(), priority: data.priority });
      }
    }
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return found.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  static getSuggestedSection(drug, primaryTopic) {
    if (!drug) return null;
    const map = { adverseEvents: 'adverse-events', mechanism: 'mechanism', combination: 'combination', efficacy: 'efficacy' };
    return primaryTopic ? (map[primaryTopic.topicId] || 'overview') : 'overview';
  }

  static analyze(query) {
    if (!query?.trim()) return null;
    const drug = this.detectDrug(query);
    const topics = this.detectTopics(query);
    return { query, drug, topics, hasMOAMatch: !!(drug && topics.length > 0), suggestedMOASection: this.getSuggestedSection(drug, topics[0]) };
  }
}

// ── normalise whatever shape the API returns into { pubmed: [], clinical_trials: [] }
function normalizeResults(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const KEY_MAP = { clinicalTrials: 'clinical_trials', clinical_trials: 'clinical_trials', pubmed: 'pubmed' }
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [KEY_MAP[k] ?? k, Array.isArray(v) ? v : []])
  )
}

export default function SearchPage() {
  const [query, setQuery]               = useState('');
  const [results, setResults]           = useState({});   // object keyed by source
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [keywordAnalysis, setKeywordAnalysis] = useState(null);
  const [searched, setSearched]         = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (e, overrideQuery) => {
    if (e) e.preventDefault();
    const q = (overrideQuery ?? query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResults({});
    setSummary(null);
    setSearched(true);

    try {
      setKeywordAnalysis(MedicalKeywordDetector.analyze(q));

      const response = await axios.post('/api/search', { question: q });
      const data = response.data;
      setResults(normalizeResults(data?.results));
      setSummary(data?.summary ?? null);
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const navigateToMOA = (drugId, section) => navigate(`/moa?drug=${drugId}&section=${section}`);

  // flatten all results into one array for display
  const allResults = Object.values(results).flat();
  const totalCount = allResults.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Medical Research Search</h1>
          <p className="text-lg text-gray-600">Search PubMed and ClinicalTrials.gov</p>
        </header>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'Jardiance adverse events', 'Mounjaro mechanism'..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {keywordAnalysis?.hasMOAMatch && (
          <MOASuggestionBanner analysis={keywordAnalysis} onNavigate={navigateToMOA} />
        )}

        {summary?.conclusion && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h3 className="font-bold text-blue-900 mb-2">AI Summary</h3>
            <p className="text-sm text-blue-800">{summary.conclusion}</p>
            {summary.disclaimer && (
              <p className="text-xs text-blue-600 mt-3 italic">{summary.disclaimer}</p>
            )}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && totalCount > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {totalCount} result{totalCount !== 1 ? 's' : ''}
            </h2>
            {Object.entries(results).map(([source, articles]) =>
              articles.map((article, idx) => (
                <SearchResultCard
                  key={article.id ?? `${source}-${idx}`}
                  article={article}
                  source={source}
                />
              ))
            )}
          </div>
        )}

        {!loading && searched && totalCount === 0 && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-gray-700">No results found for "{query}".</p>
          </div>
        )}

        {!loading && !searched && <EmptyState onSearch={(q) => { setQuery(q); handleSearch(null, q); }} />}
      </div>
    </div>
  );
}

function MOASuggestionBanner({ analysis, onNavigate }) {
  const { drug, topics, suggestedMOASection } = analysis;
  if (!drug) return null;
  const topicNames = { adverseEvents: 'Safety Profile', mechanism: 'Mechanism of Action', combination: 'Combination Therapy', efficacy: 'Efficacy Data' };
  const topicEmojis = { adverseEvents: '⚠️', mechanism: '🔬', combination: '💊', efficacy: '📈' };
  const primary = topics[0];
  return (
    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{topicEmojis[primary?.topicId] || '💡'}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-blue-900 mb-1">We found what you are looking for!</h3>
          <p className="text-sm text-blue-800 mb-3">
            Your search mentions <strong>{drug.drugName}</strong> — view the interactive <strong>{topicNames[primary?.topicId] || 'Overview'}</strong>.
          </p>
          <button
            onClick={() => onNavigate(drug.drugId, suggestedMOASection)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            View {drug.drugName} {topicNames[primary?.topicId] || 'Overview'} →
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ article, source }) {
  const [expanded, setExpanded] = useState(false);
  const isPubMed = source === 'pubmed';
  const bodyText = article.abstract ?? article.summary ?? null;
  const displayDate = article.publicationDate ?? article.pubDate ?? article.startDate ?? null;

  const authorText = Array.isArray(article.authors) && article.authors.length > 0
    ? article.authors.slice(0, 3).map(a => typeof a === 'string' ? a : `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim()).join(', ')
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="text-lg font-semibold text-blue-800 leading-snug">{article.title || 'Untitled'}</h3>
        <span className={`text-xs px-2 py-1 rounded font-medium shrink-0 ${isPubMed ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
          {isPubMed ? 'PubMed' : 'Trial'}
        </span>
      </div>
      {authorText && <p className="text-sm text-gray-600 mt-1">{authorText}</p>}
      {article.journal && <p className="text-xs text-gray-500 mt-1 italic">{article.journal}</p>}
      {displayDate && <p className="text-xs text-gray-500 mt-1">{displayDate}</p>}
      {!isPubMed && article.status && (
        <p className={`text-xs font-medium mt-1 ${article.status === 'RECRUITING' ? 'text-green-700' : 'text-gray-600'}`}>
          {article.status}
        </p>
      )}
      {bodyText && (
        <>
          <p className={`text-sm text-gray-700 mt-3 ${expanded ? '' : 'line-clamp-3'}`}>{bodyText}</p>
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium">
            {expanded ? 'Show less' : 'Show more'}
          </button>
        </>
      )}
      {article.url && (
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-blue-600 mt-3 inline-block underline">
          {isPubMed ? `PMID: ${article.id}` : `NCT: ${article.id}`} →
        </a>
      )}
    </div>
  );
}

function EmptyState({ onSearch }) {
  const suggestions = [
    { title: 'Jardiance Adverse Events', description: 'Safety profile and side effects', query: 'Jardiance adverse events' },
    { title: 'Mounjaro Mechanism', description: 'How tirzepatide works', query: 'Mounjaro mechanism of action' },
    { title: 'Combination Therapy', description: 'Mounjaro + Jardiance together', query: 'tirzepatide empagliflozin combination' },
    { title: 'Clinical Trials', description: 'Recent research and outcomes', query: 'Mounjaro clinical trials T2D' },
  ];
  return (
    <div className="bg-white rounded-lg p-12 text-center">
      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Medical Research</h2>
      <p className="text-gray-600 mb-8">Try searching for drug names, adverse events, mechanisms, or clinical trials.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {suggestions.map(s => (
          <div key={s.query} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition text-left">
            <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{s.description}</p>
            <button onClick={() => onSearch(s.query)} className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
              Search
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export { MedicalKeywordDetector };