/**
 * VISUALIZATION SELECTOR
 * Intelligently selects visualization based on data and context
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
        hasHierarchy: this.hasHierarchy(data),
        trend: this.detectTrend(data),
        hasStackableData: this.hasStackableData(data),
      };
    }
    return {};
  }

  static isTimeSeries(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const timeFields = ['time', 'date', 'week', 'month', 'year', 'day', 'hour'];
    return timeFields.some((field) => field in data[0]);
  }

  static isComparison(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const categoryFields = ['drug', 'category', 'treatment', 'group', 'name', 'label', 'event'];
    return categoryFields.some((field) => field in data[0]);
  }

  static countMetrics(data) {
    if (!Array.isArray(data) || data.length === 0) return 0;
    return Object.keys(data[0]).filter((key) => {
      const value = data[0][key];
      return typeof value === 'number' && !isNaN(value);
    }).length;
  }

  static isDistribution(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const numericValues = Object.values(data[0]).filter((v) => typeof v === 'number');
    return numericValues.every((v) => v >= 0 && v <= 100);
  }

  static hasHierarchy(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    return Object.values(data[0]).some((v) => Array.isArray(v) || (typeof v === 'object' && v !== null));
  }

  static detectTrend(data) {
    if (!Array.isArray(data) || data.length < 2) return 'stable';
    const numericKey = Object.keys(data[0]).find((k) => typeof data[0][k] === 'number');
    if (!numericKey) return 'stable';
    const first = data[0][numericKey];
    const last = data[data.length - 1][numericKey];
    if (last > first * 1.1) return 'increasing';
    if (last < first * 0.9) return 'decreasing';
    return 'stable';
  }

  static hasStackableData(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    const severityKeys = ['common', 'serious', 'rare', 'mild', 'moderate', 'severe'];
    return severityKeys.some((key) => key in data[0]);
  }

  static selectAdverseEventsViz(characteristics) {
    if (characteristics.hasStackableData && characteristics.metricCount >= 2) {
      return 'stacked-bar';
    }
    if (characteristics.isComparison && characteristics.isDistribution) {
      return 'bar';
    }
    return 'bar';
  }

  static selectEfficacyViz(characteristics) {
    if (characteristics.isComparison) {
      return characteristics.metricCount >= 3 ? 'grouped-bar' : 'bar';
    }
    if (characteristics.isTimeSeries) return 'line';
    return 'grouped-bar';
  }

  static selectTimelineViz(characteristics) {
    if (characteristics.isTimeSeries) {
      return characteristics.metricCount >= 2 ? 'composed' : 'line';
    }
    if (characteristics.trend !== 'stable') return 'area';
    return 'line';
  }

  static selectMechanismViz(characteristics) {
    if (characteristics.hasHierarchy) return 'custom-svg';
    return 'table';
  }

  static selectComparisonViz(characteristics) {
    if (characteristics.metricCount >= 3) return 'radar';
    if (characteristics.isDistribution) return 'bar';
    return 'grouped-bar';
  }

  static selectDistributionViz(characteristics) {
    if (characteristics.dataPoints <= 6) return 'pie';
    return 'bar';
  }

  static selectDefaultViz(characteristics) {
    if (characteristics.isTimeSeries) return 'line';
    if (characteristics.isComparison) return 'bar';
    return 'table';
  }

  static selectVisualization(data, context) {
    const characteristics = this.analyzeDataCharacteristics(data);
    switch (context) {
      case 'adverse-events':  return this.selectAdverseEventsViz(characteristics);
      case 'efficacy':        return this.selectEfficacyViz(characteristics);
      case 'timeline':        return this.selectTimelineViz(characteristics);
      case 'mechanism':       return this.selectMechanismViz(characteristics);
      case 'comparison':      return this.selectComparisonViz(characteristics);
      case 'distribution':    return this.selectDistributionViz(characteristics);
      default:                return this.selectDefaultViz(characteristics);
    }
  }
}

export { VisualizationSelector };
