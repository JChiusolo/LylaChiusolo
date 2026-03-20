// netlify/functions/search.js
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Step 1: Ask Claude to parse the natural-language question ──────────────
async function parseQueryWithAI(naturalLanguageQuestion) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are a biomedical search expert. Convert the following natural language medical question into concise search terms. Keep queries SHORT — max 8 words per query. Return ONLY valid JSON, no markdown, no explanation.

Question: "${naturalLanguageQuestion}"

Return this exact structure:
{
  "intent": "one sentence describing what the user is asking",
  "pubmed": {
    "query": "short PubMed query max 8 words using key MeSH terms only",
    "filters": ["Review", "Clinical Trial"]
  },
  "clinicalTrials": {
    "condition": "primary condition only, 1-3 words",
    "intervention": "intervention only, 1-3 words",
    "keywords": ["keyword1", "keyword2"]
  },
  "concepts": ["concept 1", "concept 2", "concept 3"]
}`,
      },
    ],
  });

  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  return JSON.parse(text);
}

// ── Step 2: Search PubMed ──────────────────────────────────────────────────
async function searchPubMed(parsedQuery, maxResults) {
  const term = encodeURIComponent(parsedQuery.pubmed.query);
  const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  const apiKey = process.env.PUBMED_API_KEY
    ? `&api_key=${process.env.PUBMED_API_KEY}`
    : "";

  const searchUrl = `${baseUrl}/esearch.fcgi?db=pubmed&term=${term}&retmax=${maxResults}&retmode=json&usehistory=y${apiKey}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const ids = searchData.esearchresult?.idlist ?? [];

  if (ids.length === 0) return [];

  const summaryUrl = `${baseUrl}/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json${apiKey}`;
  const summaryRes = await fetch(summaryUrl);
  const summaryData = await summaryRes.json();

  return ids.map((id) => {
    const doc = summaryData.result?.[id] ?? {};
    return {
      id,
      title: doc.title ?? "No title",
      authors: (doc.authors ?? []).map((a) => a.name).slice(0, 3),
      journal: doc.fulljournalname ?? doc.source ?? "",
      pubDate: doc.pubdate ?? "",
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      source: "PubMed",
    };
  });
}

// ── Step 3: Search ClinicalTrials.gov (v2 API) ────────────────────────────
async function searchClinicalTrials(parsedQuery, maxResults) {
  const { condition, intervention, keywords } = parsedQuery.clinicalTrials;

  const params = new URLSearchParams({
    format: "json",
    pageSize: String(maxResults),
    fields: "NCTId,BriefTitle,OverallStatus,Condition,InterventionName,BriefSummary,StartDate",
  });

  const queryParts = [];
  if (condition) queryParts.push(condition);
  if (intervention) queryParts.push(intervention);
  if (keywords?.length) queryParts.push(...keywords.slice(0, 2));
  params.set("query.term", queryParts.join(" "));

  const url = `https://clinicaltrials.gov/api/v2/studies?${params}`;
  const res = await fetch(url);
  const data = await res.json();

  return (data.studies ?? []).map((s) => {
    const p = s.protocolSection ?? {};
    const id = p.identificationModule?.nctId ?? "";
    return {
      id,
      title: p.identificationModule?.briefTitle ?? "No title",
      status: p.statusModule?.overallStatus ?? "",
      conditions: p.conditionsModule?.conditions ?? [],
      interventions: (p.armsInterventionsModule?.interventions ?? [])
        .map((i) => i.name)
        .slice(0, 3),
      summary: (p.descriptionModule?.briefSummary ?? "").slice(0, 300),
      startDate: p.statusModule?.startDateStruct?.date ?? "",
      url: `https://clinicaltrials.gov/study/${id}`,
      source: "ClinicalTrials.gov",
    };
  });
}

// ── Step 4: AI synthesis of results ───────────────────────────────────────
async function synthesizeResults(question, parsedQuery, pubmedResults, trialResults) {
  const context = [
    `PubMed returned ${pubmedResults.length} articles. Top titles:`,
    ...pubmedResults.slice(0, 5).map((r) => `- ${r.title}`),
    `\nClinicalTrials.gov returned ${trialResults.length} studies. Top titles:`,
    ...trialResults.slice(0, 5).map((r) => `- ${r.title} (${r.status})`),
  ].join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Based on this medical literature search, provide a brief evidence summary answering the user's question. Be factual and concise.

User question: "${question}"
Search intent: "${parsedQuery.intent}"

Search results context:
${context}

Write 2-3 sentences summarizing what the evidence suggests. End with: "Please consult a healthcare professional before making any medical decisions."`,
      },
    ],
  });

  return response.content.find((b) => b.type === "text")?.text ?? "";
}

// ── Main handler ───────────────────────────────────────────────────────────
export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { question, maxResults = 10 } = JSON.parse(event.body ?? "{}");

    if (!question?.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Question is required" }),
      };
    }

    // 1. Parse question with AI
    const parsedQuery = await parseQueryWithAI(question);

    // 2. Fan out to data sources in parallel
    const [pubmedResults, trialResults] = await Promise.allSettled([
      searchPubMed(parsedQuery, maxResults),
      searchClinicalTrials(parsedQuery, maxResults),
    ]);

    const pubmed = pubmedResults.status === "fulfilled" ? pubmedResults.value : [];
    const trials = trialResults.status === "fulfilled" ? trialResults.value : [];

    // 3. AI synthesis runs after both sources return
    const summary = await synthesizeResults(question, parsedQuery, pubmed, trials);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        question,
        intent: parsedQuery.intent,
        concepts: parsedQuery.concepts,
        summary,
        results: {
          pubmed,
          clinicalTrials: trials,
        },
        searchTerms: {
          pubmedQuery: parsedQuery.pubmed.query,
          clinicalTrialsQuery: parsedQuery.clinicalTrials,
        },
      }),
    };
  } catch (err) {
    console.error("Search error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Search failed", detail: err.message }),
    };
  }
};
