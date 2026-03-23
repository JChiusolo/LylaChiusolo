import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, ScatterChart, Scatter, PieChart, Pie, RadarChart, Radar,
  ComposedChart, Area
} from 'recharts';
import { drugMechanisms } from '../data/drugMechanisms';
import { VisualizationSelector, VisualizationRenderer } from '../services/VisualizationSelector';
import { AlertCircle, CheckCircle, Info, Zap } from 'lucide-react';

/**
 * ENHANCED MOA VISUALIZATION
 * Supports URL parameters for targeted navigation
 * Intelligently selects visualizations based on data and context
 */
export default function MOAVisualization() {
  const [searchParams] = useSearchParams();
  
  // Get URL parameters
  const urlDrug = searchParams.get('drug') || 'both';
  const urlSection = searchParams.get('section') || 'overview';
  
  // State
  const [activeTab, setActiveTab] = useState(urlSection);
  const [autoSelect, setAutoSelect] = useState(true);
  const [manualVizType, setManualVizType] = useState(null);

  // Sync URL section changes to tab
  useEffect(() => {
    setActiveTab(urlSection);
  }, [urlSection]);

  // DATA PREPARATION
  // ================

  // Efficacy comparison
  const efficacyComparison = [
    { drug: 'Mounjaro', a1c: -1.8, weight: -16.5, cardiovascular: 0, renal: 0 },
    { drug: 'Jardiance', a1c: -0.7, weight: -4.2, cardiovascular: -38, renal: -35 },
    { drug: 'Combined', a1c: -2.8, weight: -18, cardiovascular: -35, renal: -35 }
  ];

  // Timeline data
  const treatmentTimeline = [
    { week: 0, mounjaro: 2.5, a1c: 8.2 },
    { week: 4, mounjaro: 5, a1c: 7.9 },
    { week: 8, mounjaro: 10, a1c: 7.5 },
    { week: 12, mounjaro: 15, a1c: 7.0 },
    { week: 16, mounjaro: 15, a1c: 6.5 }
  ];

  // ADVERSE EVENTS DATA - Structured for stacked bar
  const jardanceAdverseEvents = [
    { event: 'Genital infections', common: 12, serious: 0.5, rare: 0 },
    { event: 'Urinary tract infections', common: 7, serious: 1, rare: 0.1 },
    { event: 'Nausea', common: 3, serious: 0.1, rare: 0 },
    { event: 'Diarrhea', common: 2, serious: 0.1, rare: 0 },
    { event: 'DKA', common: 0, serious: 0.1, rare: 0.05 }
  ];

  const mounjuroAdverseEvents = [
    { event: 'Nausea', common: 35, serious: 2, rare: 0.1 },
    { event: 'Vomiting', common: 10, serious: 1, rare: 0.05 },
    { event: 'Diarrhea', common: 22, serious: 1, rare: 0.5 },
    { event: 'Constipation', common: 20, serious: 0.5, rare: 0.1 },
    { event: 'Pancreatitis', common: 0, serious: 0.1, rare: 0.05 }
  ];

  // INTELLIGENT VISUALIZATION SELECTION
  // ===================================

  const selectedVisualizations = useMemo(() => {
    return {
      efficacy: autoSelect 
        ? VisualizationSelector.selectVisualization(efficacyComparison, 'efficacy')
        : manualVizType || VisualizationSelector.selectVisualization(efficacyComparison, 'efficacy'),
      
      timeline: autoSelect
        ? VisualizationSelector.selectVisualization(treatmentTimeline, 'timeline')
        : manualVizType || VisualizationSelector.selectVisualization(treatmentTimeline, 'timeline'),
      
      jardanceAdverseEvents: autoSelect
        ? VisualizationSelector.selectVisualization(jardanceAdverseEvents, 'adverse-events')
        : manualVizType || VisualizationSelector.selectVisualization(jardanceAdverseEvents, 'adverse-events'),
      
      mounjuroAdverseEvents: autoSelect
        ? VisualizationSelector.selectVisualization(mounjuroAdverseEvents, 'adverse-events')
        : manualVizType || VisualizationSelector.selectVisualization(mounjuroAdverseEvents, 'adverse-events')
    };
  }, [autoSelect, manualVizType]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            efficacyData={efficacyComparison}
            efficacyVizType={selectedVisualizations.efficacy}
            autoSelect={autoSelect}
            onChangeVizType={setManualVizType}
          />
        );
      case 'mounjaro':
        return <MounjuroTab />;
      case 'jardiance':
        return <JardianceTab />;
      case 'combination':
        return (
          <CombinationTab 
            timelineData={treatmentTimeline}
            timelineVizType={selectedVisualizations.timeline}
            autoSelect={autoSelect}
            onChangeVizType={setManualVizType}
          />
        );
      case 'adverse-events':
        return (
          <AdverseEventsTab
            jardanceData={jardanceAdverseEvents}
            mounjuroData={mounjuroAdverseEvents}
            jardanceVizType={selectedVisualizations.jardanceAdverseEvents}
            mounjuroVizType={selectedVisualizations.mounjuroAdverseEvents}
            autoSelect={autoSelect}
            onChangeVizType={setManualVizType}
          />
        );
      case 'evidence':
        return <EvidenceTab />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Drug Mechanism of Action
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Mounjaro (Tirzepatide) + Jardiance (Empagliflozin) Combination Therapy
          </p>
          
          {/* Smart Selection Toggle */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <Zap className="w-5 h-5 text-blue-600" />
              <label className="text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={autoSelect}
                  onChange={(e) => setAutoSelect(e.target.checked)}
                  className="mr-2 rounded"
                />
                <span className="text-blue-900">
                  {autoSelect ? '✓ Smart Visualization Selection' : 'Manual Visualization Selection'}
                </span>
              </label>
            </div>
            <p className="text-xs text-blue-700 max-w-md">
              {autoSelect 
                ? 'Automatically choosing optimal chart type for data characteristics'
                : 'You can manually select visualization types'
              }
            </p>
          </div>
        </header>

        {/* Warning Banner */}
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">Educational Information</h3>
              <p className="text-sm text-yellow-800 mt-1">
                This tool provides educational information about drug mechanisms. It is not medical advice. 
                Please consult with your healthcare provider before making treatment decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'mounjaro', label: 'Mounjaro' },
              { id: 'jardiance', label: 'Jardiance' },
              { id: 'combination', label: 'Combination' },
              { id: 'adverse-events', label: '⚠️ Safety' },
              { id: 'evidence', label: 'Evidence' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer References */}
        <footer className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Clinical References</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• JAMA. 2023. Efficacy and Safety of Tirzepatide in Type 2 Diabetes (SUSTAIN trials)</li>
            <li>• N Engl J Med. 2015. Empagliflozin and Cardiovascular Outcomes (EMPA-REG OUTCOME)</li>
            <li>• Diabetes Care. 2023. SGLT2 Inhibitors and Cardiorenal Protection (Multiple RCTs)</li>
            <li>• FDA. Drug approvals: Mounjaro (2022), Jardiance (2014)</li>
          </ul>
        </footer>
      </div>
    </div>
  );
}

/**
 * TAB COMPONENTS
 */

function OverviewTab({ efficacyData, efficacyVizType, autoSelect, onChangeVizType }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Efficacy Comparison</h2>
          {autoSelect && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-medium">Auto-selected:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                {efficacyVizType.replace('-', ' ')} chart
              </span>
            </div>
          )}
        </div>

        {VisualizationRenderer.render(efficacyData, efficacyVizType, {
          height: 400,
          title: 'Efficacy Metrics by Treatment'
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          title="✓ Why Combine?"
          color="green"
          items={[
            'Complementary mechanisms (GLP-1/GIP + SGLT2)',
            'Different sites of action prevent resistance',
            'Additive A1c reduction (~3%)',
            'Synergistic cardiovascular protection'
          ]}
        />
        <FeatureCard
          title="📊 Expected Outcomes"
          color="blue"
          items={[
            'A1c reduction: -2.8 to -3.0%',
            'Weight loss: -13 to -27 lbs',
            'CV outcomes: >40% risk reduction',
            'Renal protection: 35-40% risk reduction'
          ]}
        />
      </div>
    </div>
  );
}

function AdverseEventsTab({ jardanceData, mounjuroData, jardanceVizType, mounjuroVizType, autoSelect, onChangeVizType }) {
  const [selectedDrug, setSelectedDrug] = useState('jardiance');
  const [selectedVizOverride, setSelectedVizOverride] = useState(null);

  const data = selectedDrug === 'jardiance' ? jardanceData : mounjuroData;
  const vizType = selectedVizOverride || (selectedDrug === 'jardiance' ? jardanceVizType : mounjuroVizType);
  const vizOptions = ['bar', 'stacked-bar', 'line', 'pie'];

  return (
    <div className="space-y-6">
      {/* Drug Selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedDrug('jardiance')}
          className={`px-4 py-2 rounded font-medium transition ${
            selectedDrug === 'jardiance'
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Jardiance
        </button>
        <button
          onClick={() => setSelectedDrug('mounjaro')}
          className={`px-4 py-2 rounded font-medium transition ${
            selectedDrug === 'mounjaro'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Mounjaro
        </button>
      </div>

      {/* Visualization Type Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedDrug === 'jardiance' ? 'Jardiance' : 'Mounjaro'} Adverse Events
        </h2>
        {autoSelect && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Auto-selected:</span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
              {vizType.replace('-', ' ')} chart
            </span>
          </div>
        )}
      </div>

      {!autoSelect && (
        <div className="flex gap-2 flex-wrap">
          {vizOptions.map(viz => (
            <button
              key={viz}
              onClick={() => setSelectedVizOverride(viz)}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                vizType === viz
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {viz.replace('-', ' ')}
            </button>
          ))}
        </div>
      )}

      {/* Render Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        {VisualizationRenderer.render(data, vizType, {
          height: 400,
          xAxisKey: 'event',
          stackKeys: ['common', 'serious', 'rare'],
          colors: ['#fbbf24', '#f97316', '#dc2626'],
          title: `${selectedDrug === 'jardiance' ? 'Jardiance' : 'Mounjaro'} Adverse Events Distribution`
        })}
      </div>

      {/* Safety Summary */}
      <SafetySummaryCard
        drug={selectedDrug === 'jardiance' ? 'Jardiance' : 'Mounjaro'}
        data={data}
      />
    </div>
  );
}

function CombinationTab({ timelineData, timelineVizType, autoSelect, onChangeVizType }) {
  const [selectedVizOverride, setSelectedVizOverride] = useState(null);
  const currentViz = selectedVizOverride || timelineVizType;
  const vizOptions = ['line', 'area', 'composed', 'bar'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Treatment Timeline</h2>
        {autoSelect && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Auto-selected:</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              {currentViz.replace('-', ' ')} chart
            </span>
          </div>
        )}
      </div>

      {!autoSelect && (
        <div className="flex gap-2 flex-wrap">
          {vizOptions.map(viz => (
            <button
              key={viz}
              onClick={() => setSelectedVizOverride(viz)}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                currentViz === viz
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {viz.replace('-', ' ')}
            </button>
          ))}
        </div>
      )}

      {VisualizationRenderer.render(timelineData, currentViz, {
        height: 300,
        title: 'A1c Response Over Treatment Timeline'
      })}
    </div>
  );
}

function SafetySummaryCard({ drug, data }) {
  const commonEvents = data.filter(e => e.common > 5);
  const seriousEvents = data.filter(e => e.serious > 0);
  const rareEvents = data.filter(e => e.rare > 0);

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
      <h3 className="font-bold text-gray-900 mb-4">{drug} Safety Summary</h3>
      
      <div className="space-y-3">
        <div className="bg-white p-3 rounded">
          <div className="text-xs font-medium text-yellow-700 mb-1">COMMON, &lt;5% incidence</div>
          <div className="text-sm text-gray-700">
            {commonEvents.length > 0 
              ? commonEvents.map(e => e.event).join(', ')
              : 'None'}
          </div>
        </div>

        <div className="bg-white p-3 rounded">
         <div className="text-xs font-medium text-orange-700 mb-1">SERIOUS, &lt;1% incidence</div>
          <div className="text-sm text-gray-700">
            {seriousEvents.length > 0
              ? seriousEvents.map(e => e.event).join(', ')
              : 'None reported'}
          </div>
        </div>

        <div className="bg-white p-3 rounded">
          <div className="text-xs font-medium text-red-700 mb-1">RARE, &lt;.5% incidence</div>
          <div className="text-sm text-gray-700">
            {rareEvents.length > 0
              ? rareEvents.map(e => e.event).join(', ')
              : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, color, items }) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    red: 'bg-red-50 border-red-200 text-red-900'
  };

  return (
    <div className={`border rounded-lg p-4 ${colors[color]}`}>
      <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm flex items-start gap-2">
            <span className="text-lg leading-none">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Placeholder components
function MounjuroTab() { return <div className="text-gray-700">Mounjaro detailed information...</div>; }
function JardianceTab() { return <div className="text-gray-700">Jardiance detailed information...</div>; }
function EvidenceTab() { return <div className="text-gray-700">Clinical evidence references...</div>; }
;
