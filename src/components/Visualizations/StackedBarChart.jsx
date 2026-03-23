import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Stacked Bar Chart for adverse events
 * Displays event severity levels stacked horizontally
 */
export function StackedBarChart({ 
  data, 
  height = 400,
  xAxisKey = 'event',
  stackKeys = ['common', 'serious', 'rare'],
  colors = ['#fbbf24', '#f97316', '#dc2626'],
  title = 'Adverse Events Distribution'
}) {
  
  if (!data || !Array.isArray(data)) {
    return <div className="text-gray-500 p-4">No data to display</div>;
  }

  const getLabelForKey = (key) => {
    const labels = {
      common: 'Common (>5%)',
      serious: 'Serious (<1%)',
      rare: 'Rare (<0.5%)'
    };
    return labels[key] || key;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-3 text-xs">
          {stackKeys.map((key, idx) => (
            <div key={key} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: colors[idx] }}
              />
              <span className="text-gray-600">
                {getLabelForKey(key)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" label={{ value: 'Incidence (%)', position: 'bottom' }} />
          <YAxis 
            dataKey={xAxisKey}
            type="category"
            width={140}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => `${value}%`}
            contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
          />
          <Legend />
          
          {stackKeys.map((key, idx) => (
            <Bar
              key={key}
              dataKey={key}
              stackId="severity"
              fill={colors[idx]}
              name={getLabelForKey(key)}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <div className="text-xs text-yellow-700 font-medium">COMMON AVG</div>
          <div className="text-sm text-yellow-900 font-bold">
            {(data.reduce((sum, d) => sum + (d.common || 0), 0) / data.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-orange-50 p-3 rounded border border-orange-200">
          <div className="text-xs text-orange-700 font-medium">SERIOUS AVG</div>
          <div className="text-sm text-orange-900 font-bold">
            {(data.reduce((sum, d) => sum + (d.serious || 0), 0) / data.length).toFixed(2)}%
          </div>
        </div>
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <div className="text-xs text-red-700 font-medium">RARE AVG</div>
          <div className="text-sm text-red-900 font-bold">
            {(data.reduce((sum, d) => sum + (d.rare || 0), 0) / data.length).toFixed(3)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default StackedBarChart;
