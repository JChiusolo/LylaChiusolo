import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, TrendingUp, Zap } from 'lucide-react';

/**
 * KEYWORD DETECTOR
 * Analyzes search queries to detect medical topics and drugs
 */
class MedicalKeywordDetector {
  
  static DRUG_PATTERNS = {
    jardiance: {
      keywords: ['jardiance', 'empagliflozin', 'sglt2'],
      category: 'SGLT2 inhibitor'
    },
    mounjaro: {
      keywords: ['mounjaro', 'tirzepatide', 'glp-1/gip', 'glp-1 gip'],
      category: 'Dual GLP-1/GIP Agonist'
    }
  };

  static TOPIC_PATTERNS = {
    adverseEvents: {
      keywords: ['adverse', 'side effect', 'safety', 'event', 'toxicity', 'tolerability', 'adverse event'],
      priority: 'HIGH'
    },
    mechanism: {
      keywords: ['mechanism', 'moa', 'how.*work', 'receptor', 'pathway', 'target'],
      priority: 'MEDIUM'
    },
    combination: {
      keywords: ['combination', 'together', 'plus', 'dual', 'synerg'],
      priority: 'MEDIUM'
    },
    efficacy: {
      keywords: ['efficacy', 'effectiveness', 'reduction', 'a1c', 'weight loss', 'outcome'],
      priority: 'LOW'
    }
  };

  /**
   * Detect drug in query
   */
  static detectDrug(query) {
    const lowerQuery = query.toLowerCase();
    
    for (const [drugId, data] of Object.entries(this.DRUG_PATTERNS)) {
      if (data.keywords.some(keyword => new RegExp(keyword, 'i').test(lowerQuery))) {
        return {
          drugId,
          drugName: drugId.charAt(0).toUpperCase() + drugId.slice(1),
          category: data.category
        };
      }
    }
    
    return null;
  }

  /**
   * Detect topics in query
   */
  static detectTopics(query) {
    const lowerQuery = query.toLowerCase();
    const detectedTopics = [];

    for (const [topicId, data] of Object.entries(this.TOPIC_PATTERNS)) {
      if (data.keywords.some(keyword => new RegExp(keyword, 'i').test(lowerQuery))) {
        detectedTopics.push({
          topicId,
          displayName: topicId.replace(/([A-Z])/g, ' $1').trim(),
          priority: data.priority
        });
      }
    }

    // Sort by priority
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return detectedTopics.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Main detection function
   */
  static analyze(query) {
    if (!query || query.trim().length === 0) {
      return null;
    }

    const drug = this.detectDrug(query);
    const topics = this.detectTopics(query);

    return {
      query,
      drug,
      topics,
      hasMOAMatch: drug && (topics.length > 0),
      suggestedMOASection: this.getSuggestedSection(drug, topics[0])
    };
  }

  /**
   * Recommend which MOA section to navigate to
   */
  static getSuggestedSection(drug, primaryTopic) {
    if (!drug) return null;

    const topicToSection = {
      adverseEvents: 'adverse-events',
      mechanism: 'mechanism',
      combination: 'combination',
      efficacy: 'efficacy'
    };

    return primaryTopic ? topicToSection[primaryTopic.topicId] : 'overview';
  }
}

/**
 * MAIN SEARCH PAGE COMPONENT
 */
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keywordAnalysis, setKeywordAnalysis] = useState(null);
  const navigate = useNavigate();

  /**
   * Handle search submission
   */
  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Analyze keywords BEFORE searching
      const analysis = MedicalKeywordDetector.analyze(query);
      setKeywordAnalysis(analysis);

      // Fetch PubMed results
      const response = await axios.get('/pubmed/results', {
        params: {
          term: query,
          retmax: 10,
          sort: 'date'
        }
      });

      setResults(response.data || []);
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  /**
   * Navigate to MOA visualization with context
   */
  const navigateToMOA = (drugId, section) => {
    navigate(`/moa/${drugId}?section=${section}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Medical Research Search
          </h1>
          <p className="text-lg text-gray-600">
            Search PubMed, ClinicalTrials.gov, and view interactive drug information
          </p>
        </header>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'Jardiance adverse events', 'Mounjaro mechanism', 'tirzepatide combination therapy'..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* SMART MOA SUGGESTION BANNER */}
        {keywordAnalysis?.hasMOAMatch && (
          <MOASuggestionBanner
            analysis={keywordAnalysis}
            onNavigate={navigateToMOA}
          />
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Research Results ({results.length})
            </h2>
            
            <div className="space-y-4">
              {results.map((result, idx) => (
                <SearchResultCard
                  key={idx}
                  result={result}
                  drugInfo={keywordAnalysis?.drug}
                />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && query && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-gray-700">
              No results found for "{query}". Try different search terms or explore our drug profiles.
            </p>
            {keywordAnalysis?.drug && (
              <button
                onClick={() => navigateToMOA(keywordAnalysis.drug.drugId, 'overview')}
                className="mt-4 px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                View {keywordAnalysis.drug.drugName} Profile
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !query && (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

/**
 * MOA SUGGESTION BANNER
 * Intelligently suggests viewing drug MOA based on search query
 */
function MOASuggestionBanner({ analysis, onNavigate }) {
  const { drug, topics, suggestedMOASection } = analysis;
  
  if (!drug) return null;

  const topicEmojis = {
    adverseEvents: '⚠️',
    mechanism: '🔬',
    combination: '💊',
    efficacy: '📈'
  };

  const topicNames = {
    adverseEvents: 'Safety Profile',
    mechanism: 'Mechanism of Action',
    combination: 'Combination Therapy',
    efficacy: 'Efficacy Data'
  };

  const primaryTopic = topics[0];
  const emoji = topicEmojis[primaryTopic?.topicId] || '💡';
  const topicName = topicNames[primaryTopic?.topicId] || 'Overview';

  return (
    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{emoji}</div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-blue-900 mb-1">
            We found what you're looking for!
          </h3>
          
          <p className="text-sm text-blue-800 mb-3">
            Your search mentions <strong>{drug.drugName}</strong> and we detected you're interested in 
            <strong> {topicName}</strong>.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {topics.map((topic) => (
              <span
                key={topic.topicId}
                className="inline-block bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-medium"
              >
                {topic.displayName}
              </span>
            ))}
          </div>

          <button
            onClick={() => onNavigate(drug.drugId, suggestedMOASection)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-md hover:shadow-lg"
          >
            View {drug.drugName} {topicName} →
          </button>
        </div>

        <div className="text-2xl">
          {drug.drugId === 'jardiance' ? '💧' : '💉'}
        </div>
      </div>
    </div>
  );
}

/**
 * SEARCH RESULT CARD
 * Displays individual PubMed search result
 */
function SearchResultCard({ result, drugInfo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
        {result.title || 'Untitled'}
      </h3>
      
      {result.authors && (
        <p className="text-sm text-gray-600 mt-2">
          {result.authors.slice(0, 3).join(', ')}
          {result.authors.length > 3 && ` et al.`}
        </p>
      )}

      {result.journal && (
        <p className="text-xs text-gray-500 mt-1">
          {result.journal} {result.year}
        </p>
      )}

      {result.abstract && (
        <div className="mt-4">
          <p className="text-sm text-gray-700 line-clamp-3">
            {result.abstract}
          </p>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>

          {expanded && (
            <p className="text-sm text-gray-700 mt-3">{result.abstract}</p>
          )}
        </div>
      )}

      {result.pmid && (
        <a
          href={`https://pubmed.ncbi.nlm.nih.gov/${result.pmid}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-blue-600 mt-4 inline-block underline"
        >
          View on PubMed →
        </a>
      )}
    </div>
  );
}

/**
 * EMPTY STATE
 * Shows helpful suggestions when page loads
 */
function EmptyState() {
  return (
    <div className="bg-white rounded-lg p-12 text-center">
      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Search Medical Research
      </h2>
      
      <p className="text-gray-600 mb-8">
        Try searching for drug names, adverse events, mechanisms of action, or clinical trial information.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <SuggestionCard
          title="Jardiance Adverse Events"
          description="Safety profile and side effects"
          query="Jardiance adverse events"
        />
        <SuggestionCard
          title="Mounjaro Mechanism"
          description="How tirzepatide works"
          query="Mounjaro mechanism of action"
        />
        <SuggestionCard
          title="Combination Therapy"
          description="Mounjaro + Jardiance together"
          query="tirzepatide empagliflozin combination"
        />
        <SuggestionCard
          title="Clinical Trials"
          description="Recent research and outcomes"
          query="Mounjaro clinical trials T2D"
        />
      </div>
    </div>
  );
}

/**
 * SUGGESTION CARD
 * Quick search suggestions
 */
function SuggestionCard({ title, description, query }) {
  const [inputValue, setInputValue] = React.useState(query);
  const navigate = useNavigate();

  const handleSuggestedSearch = async (e) => {
    e.preventDefault();
    
    // Trigger search by setting query and submitting
    const form = e.currentTarget.closest('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true }));
    }
  };

  return (
    <form onSubmit={handleSuggestedSearch} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <button
        type="submit"
        className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
      >
        Search
      </button>
    </form>
  );
}

export { MedicalKeywordDetector };
