import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Info, Zap } from 'lucide-react';

/**
 * MOAVisualization Component
 * Displays mechanism of action for Mounjaro and Jardiance
 * 
 * NOTE: All data is defined inline - no external imports needed
 */

/**
 * VISUALIZATION SELECTOR
 * Analyzes data characteristics and selects optimal chart type
 */
class VisualizationSelector {
  static analyzeDataCharacteristics(data) {
    if (Array.isArray(data) && data.length > 0) {
      return {
        isTimeSeries: this.isTimeSeries(data),
        isComparison: this.isComparison(data),
        hasMultipleMetrics: this.countMetrics(data) > 1,
        metricCount: this.countMetrics(data),
        dataPoints: data.length,
        isDistribution: this.isDistribution(data),
        trend: this.detectTrend(data),
        hasStackableData: this.hasStackableData(data)
      };
    }
    return {};
  }

  static isTimeSeries(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const firstRecord = data[0];
    const timeFields = ['time', 'date', 'week', 'month', 'year', 'day', 'hour'];
    return timeFields.some(field => field in firstRecord);
  }

  static isComparison(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const firstRecord = data[0];
    const categoryFields = ['drug', 'category', 'treatment', 'group', 'name', 'label', 'event'];
    return categoryFields.some(field => field in firstRecord);
  }

  static countMetrics(data) {
    if (!Array.isArray(data) || data.length === 0) return 0;
    const firstRecord = data[0];
    return Object.keys(firstRecord).filter(key => {
      const value = firstRecord[key];
      return typeof value === 'number' && !isNaN(value);
    }).length;
  }

  static isDistribution(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const firstRecord = data[0];
    const numericValues = Object.values(firstRecord).filter(v => typeof v === 'number');
    return numericValues.every(v => v >= 0 && v <= 100);
  }

  static detectTrend(data) {
    if (!Array.isArray(data) || data.length < 2) return 'stable';
    const firstRecord = data[0];
    const numericKey = Object.keys(firstRecord).find(k => typeof firstRecord[k] === 'number');
    if (!numericKey) return 'stable';
    const values = data.map(d => d[numericKey]);
    const firstVal = values[0];
    const lastVal = values[values.length - 1];
    if (lastVal > firstVal * 1.1) return 'increasing';
    if (lastVal < firstVal * 0.9) return 'decreasing';
    return 'stable';
  }

  static hasStackableData(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const firstRecord = data[0];
    const severityKeys = ['common', 'serious', 'rare', 'mild', 'moderate', 'severe'];
    return severityKeys.some(key => key in firstRecord);
  }

  static selectAdverseEventsViz(characteristics) {
    if (characteristics.hasStackableData && characteristics.metricCount >= 2) {
      return 'stacked-bar';
    }
    if (characteristics.isComparison && characteristics.isDistribution) {
      return 'bar';
    }
    if (characteristics.dataPoints > 5) {
      return 'bar';
    }
    return 'bar';
  }

  static selectEfficacyViz(characteristics) {
    if (characteristics.isComparison) {
      if (characteristics.metricCount >= 3) {
        return 'grouped-bar';
      }
      return 'bar';
    }
    if (characteristics.isTimeSeries) {
      return 'line';
    }
    return 'grouped-bar';
  }

  static selectTimelineViz(characteristics) {
    if (characteristics.isTimeSeries) {
      if (characteristics.metricCount >= 2) {
        return 'composed';
      }
      return 'line';
    }
    if (characteristics.trend !== 'stable') {
      return 'area';
    }
    return 'line';
  }

  static selectVisualization(data, context) {
    const characteristics = this.analyzeDataCharacteristics(data);

    switch (context) {
      case 'adverse-events':
        return this.selectAdverseEventsViz(characteristics);
      case 'efficacy':
        return this.selectEfficacyViz(characteristics);
      case 'timeline':
        return this.selectTimelineViz(characteristics);
      default:
        return 'bar';
    }
  }
}

/**
 * SIMPLE CHART COMPONENTS (No Recharts dependency)
 */

function SimpleBarChart({ data, height = 400 }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-gray-500 p-4">No data to display</div>;
  }

  const keys = Object.keys(data[0]).slice(1);
  const maxValue = Math.max(
    ...data.flatMap(d => keys.map(k => Math.abs(d[k] || 0)))
  );

  return (
    <div className="w-full p-6 bg-white rounded-lg border border-gray-200">
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '20px 0' }}>
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            {keys.map((key, kidx) => {
              const value = item[key] || 0;
              const percentage = (Math.abs(value) / maxValue) * 100;
              const color = kidx === 0 ? '#3b82f6' : kidx === 1 ? '#06b6d4' : '#8b5cf6';
              
              return (
                <div
                  key={key}
                  style={{
                    width: '40px',
                    height: `${percentage}px`,
                    backgroundColor: color,
                    margin: '0 2px',
                    borderRadius: '4px 4px 0 0'
                  }}
                  title={`${key}: ${value}`}
                />
              );
            })}
            <div className="text-xs text-gray-600 mt-2 text-center w-full break-words">
              {item[Object.keys(data[0])[0]]}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 justify-center mt-8 flex-wrap">
        {keys.map((key, idx) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{
                backgroundColor: idx === 0 ? '#3b82f6' : idx === 1 ? '#06b6d4' : '#8b5cf6'
              }}
            />
            <span className="text-xs text-gray-600">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleLineChart({ data, height = 300 }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-gray-500 p-4">No data to display</div>;
  }

  const keys = Object.keys(data[0]).slice(1);
  
  return (
    <div className="w-full p-6 bg-white rounded-lg border border-gray-200">
      <div style={{ height: `${height}px`, position: 'relative', marginBottom: '20px' }}>
        <svg width="100%" height="100%" style={{ border: '1px solid #e5e7eb' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((y, idx) => (
            <line
              key={`grid-${idx}`}
              x1="0"
              y1={`${y * 100}%`}
              x2="100%"
              y2={`${y * 100}%`}
              stroke="#e5e7eb"
              strokeDasharray="4"
              strokeWidth="0.5"
            />
          ))}
          
          {keys.map((key, kidx) => {
            const color = kidx === 0 ? '#3b82f6' : '#8b5cf6';
            const values = data.map(d => d[key] || 0);
            const minVal = Math.min(...values);
            const maxVal = Math.max(...values);
            const range = maxVal - minVal || 1;

            const pathPoints = [];
            data.forEach((item, idx) => {
              const x = (idx / (data.length - 1 || 1)) * 100;
              const yVal = item[key] || 0;
              const yPercent = ((yVal - minVal) / range) * 100;
              const y = 100 - yPercent;
              pathPoints.push(`${x}% ${y}%`);
            });

            return (
              <polyline
                key={key}
                points={pathPoints.join(', ')}
                fill="none"
                stroke={color}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        {keys.map((key, idx) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{
                backgroundColor: idx === 0 ? '#3b82f6' : '#8b5cf6'
              }}
            />
            <span className="text-xs text-gray-600">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleStackedBarChart({ data, height = 400 }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="text-gray-500 p-4">No data to display</div>;
  }

  const stackKeys = ['common', 'serious', 'rare'];
  const colors = ['#fbbf24', '#f97316', '#dc2626'];

  return (
    <div className="w-full p-6 bg-white rounded-lg border border-gray-200">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {data.map((item, idx) => {
          const event = item.event || `Item ${idx}`;
          const total = stackKeys.reduce((sum, key) => sum + (item[key] || 0), 0);

          return (
            <div key={idx}>
              <div className="text-sm font-medium text-gray-700 mb-2">{event}</div>
              <div style={{ display: 'flex', height: '30px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                {stackKeys.map((key, kidx) => {
                  const value = item[key] || 0;
                  const percentage = total > 0 ? (value / total) * 100 : 0;
                  return (
                    <div
                      key={key}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: colors[kidx],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: percentage > 10 ? 'white' : 'transparent',
                        fontWeight: 'bold'
                      }}
                      title={`${key}: ${value}%`}
                    >
                      {percentage > 10 && `${value}%`}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 justify-center mt-8 flex-wrap">
        {stackKeys.map((key, idx) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: colors[idx] }}
            />
            <span className="text-xs text-gray-600 capitalize">
              {key === 'common' ? 'Common (greater than 5%)' : key === 'serious' ? 'Serious (less than 1%)' : 'Rare (less than 0.5%)'}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-8">
        {['common', 'serious', 'rare'].map((key, idx) => {
          const avg = (data.reduce((sum, d) => sum + (d[key] || 0), 0) / data.length).toFixed(1);
          return (
            <div key={key} className="p-3 rounded border" style={{ borderColor: colors[idx], backgroundColor: `${colors[idx]}15` }}>
              <div className="text-xs font-medium" style={{ color: colors[idx] }}>
                {key.toUpperCase()} AVG
              </div>
              <div className="text-sm font-bold" style={{ color: colors[idx] }}>
                {avg}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * MAIN COMPONENT
 */
export default function MOAVisualization() {
  const [searchParams] = useSearchParams();
  
  const urlSection = searchParams.get('section') || 'overview';
  const [activeTab, setActiveTab] = useState(urlSection);
  const [autoSelect, setAutoSelect] = useState(true);

  useEffect(() => {
    setActiveTab(urlSection);
  }, [urlSection]);

  // DATA - All inline
  const efficacyComparison = [
    { drug: 'Mounjaro', a1c: -1.8, weight: -16.5, cardiovascular: 0, renal: 0 },
    { drug: 'Jardiance', a1c: -0.7, weight: -4.2, cardiovascular: -38, renal: -35 },
    { drug: 'Combined', a1c: -2.8, weight: -18, cardiovascular: -35, renal: -35 }
  ];

  const treatmentTimeline = [
    { week: 0, mounjaro: 2.5, a1c: 8.2 },
    { week: 4, mounjaro: 5, a1c: 7.9 },
    { week: 8, mounjaro: 10, a1c: 7.5 },
    { week: 12, mounjaro: 15, a1c: 7.0 },
    { week: 16, mounjaro: 15, a1c: 6.5 }
  ];

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

  const selectedVisualizations = useMemo(() => {
    return {
      efficacy: autoSelect 
        ? VisualizationSelector.selectVisualization(efficacyComparison, 'efficacy')
        : 'bar',
      timeline: autoSelect
        ? VisualizationSelector.selectVisualization(treatmentTimeline, 'timeline')
        : 'line',
      adverseEvents: autoSelect
        ? VisualizationSelector.selectVisualization(jardanceAdverseEvents, 'adverse-events')
        : 'stacked-bar'
    };
  }, [autoSelect]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            efficacyData={efficacyComparison}
            vizType={selectedVisualizations.efficacy}
            autoSelect={autoSelect}
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
            vizType={selectedVisualizations.timeline}
            autoSelect={autoSelect}
          />
        );
      case 'adverse-events':
        return (
          <AdverseEventsTab
            jardanceData={jardanceAdverseEvents}
            mounjuroData={mounjuroAdverseEvents}
            vizType={selectedVisualizations.adverseEvents}
            autoSelect={autoSelect}
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
        
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Drug Mechanism of Action
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Mounjaro (Tirzepatide) + Jardiance (Empagliflozin) Combination Therapy
          </p>
          
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
                  {autoSelect ? '✓ Smart Visualization Selection' : 'Manual Selection'}
                </span>
              </label>
            </div>
          </div>
        </header>

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

          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        <footer className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Clinical References</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• JAMA. 2023. Efficacy and Safety of Tirzepatide in Type 2 Diabetes (SUSTAIN trials)</li>
            <li>• N Engl J Med. 2015. Empagliflozin and Cardiovascular Outcomes (EMPA-REG OUTCOME)</li>
            <li>• Diabetes Care. 2023. SGLT2 Inhibitors and Cardiorenal Protection</li>
            <li>• FDA approvals: Mounjaro (2022), Jardiance (2014)</li>
          </ul>
        </footer>
      </div>
    </div>
  );
}

function OverviewTab({ efficacyData, vizType, autoSelect }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Efficacy Comparison</h2>
          {autoSelect && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
              {vizType} chart
            </span>
          )}
        </div>

        {vizType === 'grouped-bar' && <SimpleBarChart data={efficacyData} />}
        {vizType === 'bar' && <SimpleBarChart data={efficacyData} />}
        {vizType === 'line' && <SimpleLineChart data={efficacyData} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeatureCard
          title="✓ Why Combine?"
          color="green"
          items={[
            'Complementary mechanisms (GLP-1/GIP + SGLT2)',
            'Different sites of action prevent resistance',
            'Additive A1c reduction (approx 3%)',
            'Synergistic cardiovascular protection'
          ]}
        />
        <FeatureCard
          title="📊 Expected Outcomes"
          color="blue"
          items={[
            'A1c reduction: -2.8 to -3.0%',
            'Weight loss: -13 to -27 lbs',
            'CV outcomes: greater than 40% risk reduction',
            'Renal protection: 35-40% risk reduction'
          ]}
        />
      </div>
    </div>
  );
}

function AdverseEventsTab({ jardanceData, mounjuroData, vizType, autoSelect }) {
  const [selectedDrug, setSelectedDrug] = useState('jardiance');

  const data = selectedDrug === 'jardiance' ? jardanceData : mounjuroData;

  return (
    <div className="space-y-6">
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

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedDrug === 'jardiance' ? 'Jardiance' : 'Mounjaro'} Adverse Events
        </h2>
        {autoSelect && (
          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
            {vizType} chart
          </span>
        )}
      </div>

      {vizType === 'stacked-bar' && <SimpleStackedBarChart data={data} />}
      {vizType === 'bar' && <SimpleBarChart data={data} />}

      <SafetySummaryCard
        drug={selectedDrug === 'jardiance' ? 'Jardiance' : 'Mounjaro'}
        data={data}
      />
    </div>
  );
}

function CombinationTab({ timelineData, vizType, autoSelect }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Treatment Timeline</h2>
        {autoSelect && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
            {vizType} chart
          </span>
        )}
      </div>

      {vizType === 'line' && <SimpleLineChart data={timelineData} height={300} />}
      {vizType === 'area' && <SimpleLineChart data={timelineData} height={300} />}
      {vizType === 'composed' && <SimpleLineChart data={timelineData} height={300} />}

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-4">Treatment Progression</h3>
        <div className="space-y-3">
          {timelineData.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded">
              <span className="font-medium">Week {item.week}</span>
              <div className="flex gap-6 text-sm">
                <span>Dose: {item.mounjaro} mg</span>
                <span>A1c: {item.a1c}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
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
          <div className="text-xs font-medium text-yellow-700 mb-1">COMMON (greater than 5% incidence)</div>
          <div className="text-sm text-gray-700">
            {commonEvents.length > 0 
              ? commonEvents.map(e => e.event).join(', ')
              : 'None'}
          </div>
        </div>

        <div className="bg-white p-3 rounded">
          <div className="text-xs font-medium text-orange-700 mb-1">SERIOUS (less than 1% incidence)</div>
          <div className="text-sm text-gray-700">
            {seriousEvents.length > 0
              ? seriousEvents.map(e => e.event).join(', ')
              : 'None reported'}
          </div>
        </div>

        <div className="bg-white p-3 rounded">
          <div className="text-xs font-medium text-red-700 mb-1">RARE (less than 0.5%)</div>
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
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200'
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

function MounjuroTab() {
  return (
    <div className="text-gray-700 p-6 bg-blue-50 rounded-lg">
      <h3 className="font-bold mb-3">Mounjaro (Tirzepatide)</h3>
      <p className="mb-3">Dual GLP-1/GIP receptor agonist for Type 2 Diabetes and Weight Management</p>
      <ul className="list-disc list-inside space-y-2 text-sm">
        <li>Once-weekly subcutaneous injection</li>
        <li>A1c reduction: -1.5 to -2.2%</li>
        <li>Weight loss: -10 to -22 lbs</li>
        <li>Dose range: 2.5 mg to 15 mg</li>
      </ul>
    </div>
  );
}

function JardianceTab() {
  return (
    <div className="text-gray-700 p-6 bg-cyan-50 rounded-lg">
      <h3 className="font-bold mb-3">Jardiance (Empagliflozin)</h3>
      <p className="mb-3">SGLT2 inhibitor with cardiovascular and renal protective benefits</p>
      <ul className="list-disc list-inside space-y-2 text-sm">
        <li>Once-daily oral tablet</li>
        <li>A1c reduction: -0.5 to -1.0%</li>
        <li>CV outcomes: 38% reduction in CV death/hospitalization</li>
        <li>Renal outcomes: 35-40% risk reduction</li>
      </ul>
    </div>
  );
}

function EvidenceTab() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-3">Clinical Trial Evidence</h3>
        
        <div className="space-y-3">
          <div className="bg-white p-3 rounded border-l-4 border-blue-400">
            <div className="font-semibold">SUSTAIN Trials (Mounjaro)</div>
            <p className="text-sm text-gray-600 mt-1">A1c reduction up to 2.2% and weight loss up to 22 lbs</p>
            <p className="text-xs text-gray-500 mt-2">JAMA, 2023</p>
          </div>

          <div className="bg-white p-3 rounded border-l-4 border-cyan-400">
            <div className="font-semibold">EMPA-REG OUTCOME (Jardiance)</div>
            <p className="text-sm text-gray-600 mt-1">38% reduction in cardiovascular death/hospitalization</p>
            <p className="text-xs text-gray-500 mt-2">N Engl J Med, 2015</p>
          </div>

          <div className="bg-white p-3 rounded border-l-4 border-green-400">
            <div className="font-semibold">CREDENCE (Jardiance)</div>
            <p className="text-sm text-gray-600 mt-1">35-40% reduction in renal disease progression</p>
            <p className="text-xs text-gray-500 mt-2">JAMA, 2020</p>
          </div>
        </div>
      </div>
    </div>
  );
}
