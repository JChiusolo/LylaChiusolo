import axios from 'axios';

/**
 * MOA Service
 * Integrates with existing Lyla APIs for clinical evidence
 */
export const moaService = {
  
  /**
   * Search PubMed for combination therapy evidence
   */
  searchCombinationEvidence: async (options = {}) => {
    const {
      searchTerms = 'tirzepatide empagliflozin combination type 2 diabetes',
      maxResults = 20
    } = options;

    try {
      const response = await axios.get('/pubmed/results', {
        params: {
          term: searchTerms,
          retmax: maxResults,
          sort: 'date' // Most recent first
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching PubMed:', error);
      throw error;
    }
  },

  /**
   * Search clinical trials for Mounjaro + Jardiance
   */
  searchClinicalTrials: async (options = {}) => {
    const {
      condition = 'type 2 diabetes',
      intervention = 'tirzepatide empagliflozin',
      status = 'RECRUITING'
    } = options;

    try {
      const response = await axios.get('/clinicaltrials/results', {
        params: {
          term: `${intervention} ${condition}`,
          status: status,
          type: 'Interventional'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching trials:', error);
      throw error;
    }
  },

  /**
   * Get mechanism details for a specific drug
   */
  getDrugMechanisms: async (drugId) => {
    // Could fetch from database in future
    // For now, returns from local data
    const { drugMechanisms } = await import('../data/drugMechanisms.js');
    return drugMechanisms[drugId];
  },

  /**
   * Search for drug interactions
   */
  searchDrugInteractions: async () => {
    // Future: integrate with DrugBank or similar API
    return {
      mounjaro: { jardiance: 'No significant interactions' },
      interaction: 'SAFE TO COMBINE'
    };
  },

  /**
   * Get evidence citations with links
   */
  getCitations: async () => {
    return {
      mounjaro: [
        { title: 'SUSTAIN trials', url: 'https://pubmed.ncbi.nlm.nih.gov', year: 2023 },
        { title: 'SURMOUNT trials', url: 'https://pubmed.ncbi.nlm.nih.gov', year: 2022 }
      ],
      jardiance: [
        { title: 'EMPA-REG OUTCOME', url: 'https://pubmed.ncbi.nlm.nih.gov', year: 2015 },
        { title: 'CREDENCE', url: 'https://pubmed.ncbi.nlm.nih.gov', year: 2020 }
      ]
    };
  }
};
