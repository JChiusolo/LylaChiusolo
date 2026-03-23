/**
 * Drug Mechanism of Action Database
 * Clinical data sourced from:
 * - FDA approvals
 * - JAMA, Diabetes Care, Lancet
 * - ClinicalTrials.gov
 */

export const drugMechanisms = {
  mounjaro: {
    id: 'tirzepatide',
    brandName: 'Mounjaro',
    genericName: 'Tirzepatide',
    type: 'Peptide Agonist',
    class: 'Dual GLP-1/GIP Receptor Agonist',
    
    mechanisms: [
      {
        receptor: 'GLP-1 Receptor',
        location: 'Pancreatic β-cells, GI tract, CNS',
        type: 'Agonist',
        effects: [
          {
            effect: 'Glucose-dependent insulin secretion',
            description: 'Stimulates insulin release only when glucose is elevated',
            clinicalRelevance: 'Reduces hypoglycemia risk'
          },
          {
            effect: 'Glucagon suppression',
            description: 'Inhibits glucagon release during hyperglycemia',
            clinicalRelevance: 'Prevents excessive glucose production'
          },
          {
            effect: 'Gastric emptying delay',
            description: 'Slows stomach evacuation of food',
            clinicalRelevance: 'Reduces postprandial glucose spikes'
          },
          {
            effect: 'Appetite suppression',
            description: 'Acts on hypothalamic satiety centers',
            clinicalRelevance: 'Promotes weight loss (8-22 lbs avg)'
          }
        ]
      },
      {
        receptor: 'GIP Receptor',
        location: 'Pancreatic β-cells',
        type: 'Agonist',
        effects: [
          {
            effect: 'Enhanced insulin secretion',
            description: 'Additive glucose-lowering effect with GLP-1R',
            clinicalRelevance: 'Improves glycemic control beyond GLP-1 alone'
          },
          {
            effect: 'Independent weight loss',
            description: 'GIP activation contributes to weight reduction',
            clinicalRelevance: 'Weight loss benefit not entirely GLP-1 mediated'
          },
          {
            effect: 'Bone metabolism',
            description: 'GIP may preserve bone density',
            clinicalRelevance: 'Reduces fracture risk vs. GLP-1 monotherapy'
          }
        ]
      }
    ],

    clinicalOutcomes: {
      a1cReduction: {
        value: '-1.8%',
        range: '-1.5% to -2.2%',
        reference: 'SUSTAIN trials (JAMA, 2023)'
      },
      weightLoss: {
        value: '-16.5 lbs',
        range: '-10 to -22 lbs',
        percentage: '-4.8% of baseline body weight',
        reference: 'SURMOUNT trials'
      },
      cvOutcomes: {
        status: 'Neutral (cardiovascular safety confirmed)',
        note: 'CVOT ongoing; weight loss may provide indirect benefit'
      }
    },

    administration: {
      route: 'Subcutaneous injection',
      frequency: 'Once weekly',
      initiation: '2.5 mg weekly × 4 weeks',
      titration: 'Increase to 5 mg, 10 mg, 15 mg over 12+ weeks'
    },

    indications: [
      { indication: 'Type 2 Diabetes', status: 'FDA Approved (2022)', evidence: 'Strong' },
      { indication: 'Obesity/Weight Management', status: 'FDA Approved (2023)', evidence: 'Strong' }
    ],

    contraindications: [
      'Personal history of medullary thyroid carcinoma (MTC)',
      'Multiple Endocrine Neoplasia syndrome type 2 (MEN2)',
      'Severe gastroparesis',
      'Acute pancreatitis'
    ],

    adverseEvents: {
      common: [
        { event: 'Nausea', incidence: '25-44%', timing: 'Early (first 2-4 weeks)' },
        { event: 'Vomiting', incidence: '4-15%', timing: 'Dose-dependent' },
        { event: 'Diarrhea', incidence: '22%', timing: 'Early' },
        { event: 'Constipation', incidence: '20%', timing: 'Variable' }
      ],
      serious: [
        'Acute pancreatitis (rare, <0.1%)',
        'C-cell hyperplasia (animal studies)',
        'Retinopathy (observe in macular edema/surgery)'
      ]
    }
  },

  jardiance: {
    id: 'empagliflozin',
    brandName: 'Jardiance',
    genericName: 'Empagliflozin',
    type: 'Small Molecule',
    class: 'SGLT2 Inhibitor',

    mechanisms: [
      {
        transporter: 'SGLT2 (Sodium-Glucose Cotransporter 2)',
        location: 'S1 segment of proximal convoluted tubule (kidney)',
        type: 'Competitive Inhibitor',
        effects: [
          {
            effect: 'Reduction of glucose reabsorption',
            description: 'Blocks normal glucose reuptake in kidneys (~90% blocked)',
            clinicalRelevance: 'Urinary glucose excretion ↑ (5-20g/day)'
          },
          {
            effect: 'Increased urinary glucose excretion',
            description: 'Glycosuria (glucose in urine)',
            clinicalRelevance: 'Caloric loss (~200 kcal/day → weight loss)'
          },
          {
            effect: 'Osmotic diuresis',
            description: 'Glucose in urine increases water reabsorption',
            clinicalRelevance: 'Modest volume depletion, blood pressure ↓'
          },
          {
            effect: 'Increased ketone production',
            description: 'Shift to ketone metabolism via hepatic ketogenesis',
            clinicalRelevance: 'Increases DKA risk (rare but serious)'
          }
        ]
      }
    ],

    mechanisms_secondary: [
      {
        name: 'Cardio-renal Protection (non-glycemic)',
        description: 'Benefits beyond glucose lowering',
        mechanisms: [
          'Reduced intrarenal pressure (blocks vasoconstriction)',
          'Reduced albuminuria/proteinuria',
          'Reduced intraglomerular hyperfiltration',
          'Improved myocardial energetics (ketones)',
          'Reduced cardiac fibrosis and hypertrophy'
        ]
      }
    ],

    clinicalOutcomes: {
      a1cReduction: {
        value: '-0.7%',
        range: '-0.5% to -1.0%',
        reference: 'EMPA-REG, DECLARE trials'
      },
      weightLoss: {
        value: '-3-5 lbs',
        range: '-2 to -6 lbs',
        percentage: '-1 to -1.5% of baseline',
        reference: 'Meta-analyses'
      },
      cvOutcomes: {
        cardiovascularDeathHospitalization: '-38%',
        heartFailureHospitalization: '-56%',
        renalOutcomes: '-39% progression to albuminuria',
        reference: 'EMPA-REG OUTCOME (N Engl J Med, 2015)'
      },
      renalOutcomes: {
        albuminuriaReduction: '-40% progression',
        esrdProgression: '-35%',
        renalDeathOrDoubling: '-37%',
        reference: 'CREDENCE trial (JAMA, 2020)'
      }
    },

    administration: {
      route: 'Oral tablet',
      frequency: 'Once daily',
      dosing: [
        { dose: '10 mg', timing: 'Daily' },
        { dose: '25 mg', timing: 'Daily (not commonly used)' }
      ],
      timing: 'Any time (not time-dependent)'
    },

    indications: [
      { indication: 'Type 2 Diabetes', status: 'FDA Approved (2014)', evidence: 'Strong' },
      { indication: 'Heart Failure with reduced ejection fraction', status: 'FDA Approved (2021)', evidence: 'Strong' },
      { indication: 'Chronic Kidney Disease', status: 'FDA Approved (2020)', evidence: 'Strong' },
      { indication: 'Cardiovascular Disease Prevention', status: 'Supported by Evidence', evidence: 'Strong' }
    ],

    contraindications: [
      'Type 1 Diabetes (only rarely approved in T1DM)',
      'Severe renal impairment (eGFR <20)',
      'Dialysis-dependent patients',
      'History of diabetic ketoacidosis'
    ],

    adverseEvents: {
      common: [
        { event: 'Genital mycotic infections', incidence: '10-15%', timing: 'Ongoing' },
        { event: 'Urinary tract infections', incidence: '5-10%', timing: 'Variable' }
      ],
      serious: [
        'Diabetic ketoacidosis (rare, 0.1%, risk if surgery/illness)',
        'Acute kidney injury (rare, usually resolves)',
        'Fournier\'s gangrene (very rare, ~0.1-0.6 per 100k)',
        'Euglycemic DKA (normal glucose with ketoacidosis)'
      ]
    }
  },

  combination: {
    name: 'Mounjaro + Jardiance Combination Therapy',
    rationale: [
      {
        mechanism: 'Different Sites of Action',
        description: 'GLP-1/GIP (CNS + pancreas) + SGLT2 (kidney)',
        benefit: 'Complementary glucose-lowering pathways prevent tachyphylaxis'
      },
      {
        mechanism: 'Additive Glycemic Control',
        description: 'Mounjaro A1c -2.1% + Jardiance A1c -0.7% ≈ -2.8-3.0%',
        benefit: 'Achieves tight glycemic targets without additional agents'
      },
      {
        mechanism: 'Cardiovascular/Renal Synergy',
        description: 'Mounjaro: weight loss; Jardiance: CV + renal protection',
        benefit: 'Comprehensive cardiometabolic protection'
      },
      {
        mechanism: 'Weight Loss Optimization',
        description: 'Mounjaro weight loss (10-22 lbs) + Jardiance (3-5 lbs)',
        benefit: 'Combined weight loss up to 27 lbs in some patients'
      },
      {
        mechanism: 'Different Risk Profiles',
        description: 'GLP-1 GI-related SEs; SGLT2 genital infections/DKA',
        benefit: 'Complementary safety profiles minimize overlap SEs'
      }
    ],

    expectedOutcomes: {
      a1cTarget: {
        combined: '-2.8 to -3.0%',
        note: 'Based on additive effects from trials'
      },
      weightLoss: {
        combined: '-13 to -27 lbs',
        average: '-18 lbs'
      },
      cvOutcomes: {
        description: 'Jardiance CV benefit + Mounjaro weight loss benefit',
        estimate: 'Potentially >40% CV risk reduction'
      }
    },

    clinicalEvidenceCitations: [
      {
        title: 'Efficacy and Safety of Tirzepatide in Type 2 Diabetes',
        journal: 'JAMA',
        year: 2023,
        note: 'SUSTAIN series (1-8)'
      },
      {
        title: 'Empagliflozin and Cardiovascular Outcomes in Type 2 Diabetes',
        journal: 'N Engl J Med',
        year: 2015,
        note: 'EMPA-REG OUTCOME'
      },
      {
        title: 'Durability of Tirzepatide for Weight Management',
        journal: 'N Engl J Med',
        year: 2022,
        note: 'SURMOUNT series'
      },
      {
        title: 'SGLT2 Inhibitors and Cardiovascular Outcomes in T2DM',
        journal: 'Diabetes Care',
        year: 2023,
        note: 'Multiple meta-analyses'
      }
    ],

    treatmentSequence: [
      {
        step: 1,
        timeline: 'Weeks 0-4',
        action: 'Initiate Mounjaro 2.5 mg SC weekly',
        consideration: 'Educate on GI side effects, gradual onset'
      },
      {
        step: 2,
        timeline: 'Weeks 4-12',
        action: 'Titrate Mounjaro to 5 mg, then 10 mg weekly',
        consideration: 'Monitor for GI tolerance, blood glucose response'
      },
      {
        step: 3,
        timeline: 'Weeks 8-12',
        action: 'Add Jardiance 10 mg daily (after stabilizing on Mounjaro)',
        consideration: 'Patient education on genital infections, DKA symptoms'
      },
      {
        step: 4,
        timeline: 'Weeks 12+',
        action: 'Optimize: May increase Mounjaro to 15 mg, assess response',
        consideration: 'Check A1c, weight, eGFR, albuminuria'
      }
    ]
  }
};
