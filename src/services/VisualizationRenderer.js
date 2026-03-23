import React from 'react';
import { StackedBarChart } from '../components/Visualizations/StackedBarChart';
// ... other imports

/**
 * VISUALIZATION RENDERER
 * Renders the selected visualization type
 */
class VisualizationRenderer {
  
  static render(data, vizType, options = {}) {
    switch (vizType) {
      case 'stacked-bar':
        return <StackedBarChart data={data} {...options} />;
      
      case 'bar':
        return <BarVisualization data={data} {...options} />;
      
      case 'grouped-bar':
        return <GroupedBarVisualization data={data} {...options} />;
      
      case 'line':
        return <LineVisualization data={data} {...options} />;
      
      case 'area':
        return <AreaVisualization data={data} {...options} />;
      
      case 'composed':
        return <ComposedVisualization data={data} {...options} />;
      
      case 'scatter':
        return <ScatterVisualization data={data} {...options} />;
      
      case 'radar':
        return <RadarVisualization data={data} {...options} />;
      
      case 'pie':
        return <PieVisualization data={data} {...options} />;
      
      case 'custom-svg':
        return <CustomSVGVisualization data={data} {...options} />;
      
      case 'table':
      default:
        return <TableVisualization data={data} {...options} />;
    }
  }
}

export { VisualizationRenderer };
