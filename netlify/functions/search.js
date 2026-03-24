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

    // Split "Smith J" style author strings into firstName/lastName objects
    // so ResultCard's existing a.firstName + a.lastName code works unchanged
    const rawAuthors = (doc.authors ?? []).slice(0, 3);
    const authors = rawAuthors.map((a) => {
      const name = typeof a === "string" ? a : (a.name ?? "");
      const parts = name.trim().split(" ");
      const lastName = parts[0] ?? "";
      const firstName = parts.slice(1).join(" ");
      return { firstName, lastName };
    });

    return {
      id,
      pmid: id,
      title: doc.title ?? "No title",
      authors,
      abstract: (doc.title ?? ""),
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
    fields:
      "NCTId,BriefTitle,OverallStatus,Condition,InterventionName,BriefSummary,StartDate",
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

    // conditions and interventions must be arrays for ResultCard
    const conditions = p.conditionsModule?.conditions ?? [];
    const interventions = (p.armsInterventionsModule?.interventions ?? [])
      .map((i) => i.name)
      .slice(0, 3);

    return {
      id,
      pmid: null,
      title: p.identificationModule?.briefTitle ?? "No title",
      status: p.statusModule?.overallStatus ?? "",
      conditions: Array.isArray(conditions) ? conditions : [],
      interventions: Array.isArray(interventions) ? interventions : [],
      abstract: (p.descriptionModule?.briefSummary ?? "").slice(0, 300),
      summary: (p.descriptionModule?.briefSummary ?? "").slice(0, 300),
      publicationDate: p.statusModule?.startDateStruct?.date ?? "",
      startDate: p.statusModule?.startDateStruct?.date ?? "",
      url: `https://clinicaltrials.gov/study/${id}`,
      source: "clinical_trials",
    };
  });
}

async function synthesizeResults(question, parsedQuery, pubmedResults, trialResults) {
  const pubmedSources = pubmedResults.slice(0, 8)
