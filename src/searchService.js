// src/services/searchService.js

/**
 * Submit a natural language medical question to the Lyla search pipeline.
 * Claude parses the question → PubMed + ClinicalTrials are queried in parallel
 * → an AI summary is returned alongside raw results.
 *
 * @param {string} question - Natural language question, e.g. "Can fibrin glue be used on the brain?"
 * @returns {Promise<SearchResponse>}
 */
export async function searchMedicalQuestion(question) {
  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error ?? `Search failed: ${response.status}`);
  }

  return response.json();
}

/**
 * @typedef {Object} SearchResponse
 * @property {string} question        - Original question echoed back
 * @property {string} intent          - AI-parsed intent sentence
 * @property {string[]} concepts      - Key medical concepts extracted
 * @property {string} summary         - AI-synthesized evidence summary
 * @property {{ pubmed: PubMedResult[], clinicalTrials: TrialResult[] }} results
 * @property {{ pubmedQuery: string, clinicalTrialsQuery: object }} searchTerms
 */

/**
 * @typedef {Object} PubMedResult
 * @property {string} id
 * @property {string} title
 * @property {string[]} authors
 * @property {string} journal
 * @property {string} pubDate
 * @property {string} url
 * @property {string} source
 */

/**
 * @typedef {Object} TrialResult
 * @property {string} id
 * @property {string} title
 * @property {string} status
 * @property {string[]} conditions
 * @property {string[]} interventions
 * @property {string} summary
 * @property {string} startDate
 * @property {string} url
 * @property {string} source
 */
