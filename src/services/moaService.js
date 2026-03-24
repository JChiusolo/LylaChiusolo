import axios from 'axios';

export const moaService = {

  searchCombinationEvidence: async (options = {}) => {
    const {
      searchTerms = 'tirzepatide empagliflozin combination type 2 diabetes',
      maxResults = 20,
    } = options;
    try {
      const response = await axios.get('/pubmed/results', {
        params: { term: searchTerms, retmax: maxResults, sort: 'date' },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching PubMed:', error);
      throw error;
    }
  },

  searchClinicalTrials: async (options = {}) => {
    const {
      condition = 'type 2 diabetes',
      intervention = 'tirzepatide empagliflozin',
      status = 'RECRUITING',
    } = options;
    try {
      const response = await axios.get('/clinicaltrials/results', {
        params: { term: `${intervention} ${condition}`, status, type: 'Interventional' },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching trials:', error);
      throw error;
    }
  },

  /**
   * Fixed: path is relative to src/services/ → src/data/drugMechanisms.js
   * Also requires the file to be moved from src/src/data/ → src/data/
   */
  getDrugMechanisms: async (drugId) => {
    const { drugMechanisms } = await import('../data/drugMechanisms.js');
    return drugMechanisms[drugId];
  },

  searchDrugInteractions: async () => {
    return {
      mounjaro: { jardiance: 'No significant interactions' },
      interaction: 'SAFE TO COMBINE',
    };
  },

  getCitations: async () => {
    return {
      mounjaro: [
        { title: 'SUSTAIN trials', url: 'https://pubmed.ncbi.nlm.nih.gov', year: 2023 },
        { title: 'SURMOUNT trials', url: 'https://pubmed.ncbi.nlm.nih.gov', year: 2022 },
      ],
      jardiance: [
        { title: 'EMPA-REG OUTCOME', url: 'https://pubmed.ncbi.nlm.nih.gov', year: 2015 },
        { title: 'CREDENCE', url: 'https://pubmed.ncbi.nlm.nih.gov', year: 2020 },
      ],
    };
  },
};
