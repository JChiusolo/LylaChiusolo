/**
 * VISUALIZATION SELECTOR
 * Intelligently selects visualization based on data and context
 */
class VisualizationSelector {
  
  /**
   * Analyze data characteristics
   */
  static analyzeDataCharacteristics(data) {
    if (Array.isArray(data)) {
      return {
        isTimeSeries: this.isTimeSeries(data),
        isComparison: this.isComparison(data),
        hasMultipleMetrics: this.countMetrics(data) > 1,
        metricCount: this.countMetrics(data),
        dataPoints: data.length,
        isDistribution: this.isDistribution(data),
        hasHierarchy: this.hasHierarchy(data),
        trend: this.detectTrend(data),
        hasStackableData: this.hasStackableData(data) // NEW
      };
    }
    return {};
  }

  /**
   * NEW: Detect if data is suitable for stacking (multiple percentage/severity levels)
   */
  static hasStackableData(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const firstRecord = data[0];
    const severityKeys = ['common', 'serious', 'rare', 'mild', 'moderate', 'severe'];
    return severityKeys.some(key => key in firstRecord);
  }

  /**
   * UPDATED: Adverse events visualization selector
   */
  static selectAdverseEventsViz(characteristics) {
    // Has stackable data (severity levels)?
    if (characteristics.hasStackableData && characteristics.metricCount >= 2) {
      return 'stacked-bar'; // PERFECT for severity stacking
    }

    // Multiple events with percentages?
    if (characteristics.isComparison && characteristics.isDistribution) {
      return 'bar';
    }

    // Single metric, many events?
    if (characteristics.dataPoints > 5) {
      return 'bar';
    }

    return 'bar';
  }

  /**
   * UPDATED: Main selection function
   */
  static selectVisualization(data, context) {
    const characteristics = this.analyzeDataCharacteristics(data);

    switch (context) {
      case 'adverse-events':
        return this.selectAdverseEventsViz(characteristics);
      case 'efficacy':
        return this.selectEfficacyViz(characteristics);
      case 'timeline':
        return this.selectTimelineViz(characteristics);
      case 'mechanism':
        return this.selectMechanismViz(characteristics);
      case 'comparison':
        return this.selectComparisonViz(characteristics);
      case 'distribution':
        return this.selectDistributionViz(characteristics);
      default:
        return this.selectDefaultViz(characteristics);
    }
  }

  // ... rest of methods stay the same
}

export { VisualizationSelector };
