import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

async function searchPubMed(parsedQuery, maxResults) {
  const term = encodeURIComponent(parsedQuery.pubmed.query);
  const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  const apiKey = process.env.PUBMED_API_KEY ? `&api_key=${process.env.PUBMED_API_KEY}` : "";

  const searchRes = await fetch(`${baseUrl}/esearch.fcgi?db=pubmed&term=${term}&retmax=${maxResults}&retmode=json${apiKey}`);
  const searchData = await searchRes.json();
  const ids = searchData.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const summaryRes = await fetch(`${baseUrl}/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json${apiKey}`);
  const summaryData = await summaryRes.json();

  return ids.map((id) => {
    const doc = summaryData.result?.[id] ?? {};
    const rawAuthors = (doc.authors ?? []).slice(0, 3);
    const authors = rawAuthors.map((a) => {
      const name = typeof a === "string" ? a : (a.name ?? "");
      const parts = name.trim().split(" ");
      return { lastName: parts[0] ?? "", firstName: parts.slice(1).join(" ") };
    });
    return {
      id,
      pmid: id,
      title: doc.title ?? "No title",
      authors,
      abstract: doc.title ?? "",
      journal: doc.fulljournalname ?? doc.source ?? "",
      publicationDate: doc.pubdate ?? "",
      pubDate: doc.pubdate ?? "",
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      source: "pubmed",
    };
  });
}

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

  const res = await fetch(`https://clinicaltrials.gov/api/v2/studies?${params}`);
  const data = await res.json();

  return (data.studies ?? []).map((s) => {
    const p = s.protocolSection ?? {};
    const id = p.identificationModule?.nctId ?? "";
    const conditions = p.conditionsModule?.conditions ?? [];
    const interventions = (p.armsInterventionsModule?.interventions ?? []).map((i) => i.name).slice(0, 3);
    const briefSummary = (p.descriptionModule?.briefSummary ?? "").slice(0, 300);
    return {
      id,
      pmid: null,
      title: p.identificationModule?.briefTitle ?? "No title",
      status: p.statusModule?.overallStatus ?? "",
      conditions: Array.isArray(conditions) ? conditions : [],
      interventions: Array.isArray(interventions) ? interventions : [],
      abstract: briefSummary,
      summary: briefSummary,
      publicationDate: p.statusModule?.startDateStruct?.date ?? "",
      startDate: p.statusModule?.startDateStruct?.date ?? "",
      url: `https://clinicaltrials.gov/study/${id}`,
      source: "clinical_trials",
    };
  });
}

async function synthesizeResults(question, parsedQuery, pubmedResults, trialResults) {
  const pubmedSources = pubmedResults.slice(0, 8).map((r, i) => ({
    index: i + 1,
    type: "PubMed",
    title: r.title,
    authors: Array.isArray(r.authors) ? r.authors.map((a) => `${a.firstName} ${a.lastName}`.trim()).join(", ") : "",
    journal: r.journal,
    pubDate: r.pubDate,
    url: r.url,
  }));
  const trialSources = trialResults.slice(0, 5).map((r, i) => ({
    index: pubmedSources.length + i + 1,
    type: "ClinicalTrial",
    title: r.title,
    status: r.status,
    conditions: Array.isArray(r.conditions) ? r.conditions.join(", ") : "",
    interventions: Array.isArray(r.interventions) ? r.interventions.join(", ") : "",
    summary: r.summary,
    url: r.url,
  }));
  const allSources = [...pubmedSources, ...trialSources];
  const sourcesText = allSources.map((s) => {
    if (s.type === "PubMed") {
      return `[${s.index}] (PubMed) "${s.title}" — ${s.authors}. ${s.journal}, ${s.pubDate}. URL: ${s.url}`;
    }
    return `[${s.index}] (ClinicalTrial, ${s.status}) "${s.title}" — Conditions: ${s.conditions}. Interventions: ${s.interventions}. Summary: ${s.summary}. URL: ${s.url}`;
  }).join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `You are a biomedical research assistant. Summarize the evidence for this question and cite every claim using source index numbers.

User question: "${question}"

Sources:
${sourcesText}

Return ONLY valid JSON, no markdown:
{
  "conclusion": "1-2 sentence direct answer",
  "supportingSourceCount": <number>,
  "citations": [{"index": 1, "title": "...", "contribution": "...", "url": "...", "type": "PubMed or ClinicalTrial", "authors": "..."}],
  "disclaimer": "Please consult a healthcare professional before making any medical decisions."
}`,
    }],
  });

  const text = response.content.find((b) => b.type === "text")?.text ?? "{}";
  try {
    return JSON.parse(text);
  } catch {
    return { conclusion: text, supportingSourceCount: allSources.length, citations: [], disclaimer: "Please consult a healthcare professional before making any medical decisions." };
  }
}

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    const { question, maxResults = 10 } = JSON.parse(event.body ?? "{}");
    if (!question?.trim()) return { statusCode: 400, headers, body: JSON.stringify({ error: "Question is required" }) };

    const parsedQuery = await parseQueryWithAI(question);
    const [pubmedSettled, trialsSettled] = await Promise.allSettled([
      searchPubMed(parsedQuery, maxResults),
      searchClinicalTrials(parsedQuery, maxResults),
    ]);

    const pubmed = Array.isArray(pubmedSettled.value) ? pubmedSettled.value : [];
    const trials = Array.isArray(trialsSettled.value) ? trialsSettled.value : [];
    const summary = await synthesizeResults(question, parsedQuery, pubmed, trials);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        question,
        intent: parsedQuery.intent,
        concepts: parsedQuery.concepts,
        summary,
        results: { pubmed, clinical_trials: trials },
        searchTerms: { pubmedQuery: parsedQuery.pubmed.query, clinicalTrialsQuery: parsedQuery.clinicalTrials },
      }),
    };
  } catch (err) {
    console.error("Search error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Search failed", detail: err.message }) };
  }
};