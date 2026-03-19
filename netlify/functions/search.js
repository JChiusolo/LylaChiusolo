import axios from 'axios'

const PUBMED_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const TRIALS_URL = 'https://clinicaltrials.gov/api/v2'

async function searchPubMed(query, maxResults) {
  try {
    const search = await axios.get(`${PUBMED_URL}/esearch.json`, {
      params: { db: 'pubmed', term: query, retmax: maxResults, sort: 'date' }
    })

    const pmids = search.data?.esearchresult?.idlist || []
    if (!pmids.length) return []

    const details = await axios.get(`${PUBMED_URL}/efetch.json`, {
      params: { db: 'pubmed', id: pmids.join(',') }
    })

    return (details.data?.result || [])
      .filter(a => a.uid)
      .map(a => ({
        id: a.uid,
        title: a.title || 'Untitled',
        abstract: a.ab || '',
        authors: (a.authors || []).map(au => ({ firstName: au.firstname || '', lastName: au.lastname || '' })),
        publicationDate: a.pubdate,
        journal: a.source || '',
        pmid: a.uid,
        source: 'pubmed',
        url: `https://pubmed.ncbi.nlm.nih.gov/${a.uid}/`
      }))
  } catch (e) {
    console.error('PubMed error:', e.message)
    return []
  }
}

async function searchClinicalTrials(query, maxResults) {
  try {
    const response = await axios.get(`${TRIALS_URL}/studies`, {
      params: { query, pageSize: maxResults, sortField: 'StartDate', sortOrder: 'desc' }
    })

    return (response.data?.studies || []).map(study => {
      const proto = study?.protocolSection || {}
      const ident = proto?.identificationModule || {}
      const status = proto?.statusModule || {}
      const design = proto?.designModule || {}

      return {
        id: study.nctId || '',
        title: ident?.officialTitle || ident?.briefTitle || 'Untitled',
        abstract: ident?.briefSummary || '',
        publicationDate: status?.startDateStruct?.year,
        journal: 'ClinicalTrials.gov',
        trialStatus: status?.overallStatus || '',
        clinicalTrialPhase: design?.phases?.[0] || 'N/A',
        source: 'clinical_trials',
        url: `https://clinicaltrials.gov/ct2/show/${study.nctId}`
      }
    })
  } catch (e) {
    console.error('Clinical Trials error:', e.message)
    return []
  }
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Use POST' }) }
  }

  try {
    const { query, sources = ['pubmed', 'clinical_trials'], maxResults = 10 } = JSON.parse(event.body || '{}')

    if (!query?.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Query required' }) }
    }

    const results = {}

    if (sources.includes('pubmed')) {
      results.pubmed = await searchPubMed(query, maxResults)
    }
    if (sources.includes('clinical_trials')) {
      results.clinical_trials = await searchClinicalTrials(query, maxResults)
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, query, results, timestamp: new Date().toISOString() })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    }
  }
}
