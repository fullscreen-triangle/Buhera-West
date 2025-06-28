/**
 * Agricultural Terrain Classifier
 * Provides intelligent analysis of terrain characteristics for agricultural planning
 */

/**
 * Soil classification based on terrain analysis
 */
export const SoilClassifier = {
  /**
   * Classify soil type based on elevation, slope, and drainage
   */
  classifySoilType: (elevation, slope, drainageIndex, precipitationLevel) => {
    // Clay soils - low elevation, poor drainage
    if (elevation < 100 && drainageIndex < 0.3 && precipitationLevel > 0.7) {
      return {
        type: 'clay',
        characteristics: ['high_water_retention', 'nutrient_rich', 'poor_drainage'],
        suitability: ['rice', 'cotton', 'sugarcane'],
        ph_range: [6.0, 7.5],
        organic_matter: 'high'
      };
    }
    
    // Sandy soils - well-drained, gentle slopes
    if (slope < 15 && drainageIndex > 0.7 && precipitationLevel < 0.5) {
      return {
        type: 'sand',
        characteristics: ['fast_drainage', 'low_nutrients', 'easy_cultivation'],
        suitability: ['groundnuts', 'millet', 'cassava'],
        ph_range: [5.5, 7.0],
        organic_matter: 'low'
      };
    }
    
    // Loam soils - moderate characteristics (ideal agricultural soil)
    if (slope < 20 && drainageIndex > 0.4 && drainageIndex < 0.7) {
      return {
        type: 'loam',
        characteristics: ['balanced_drainage', 'good_structure', 'nutrient_retention'],
        suitability: ['maize', 'wheat', 'soybeans', 'vegetables'],
        ph_range: [6.0, 7.5],
        organic_matter: 'moderate_to_high'
      };
    }
    
    // Silt soils - moderate drainage, fine particles
    return {
      type: 'silt',
      characteristics: ['moderate_drainage', 'fine_texture', 'compaction_risk'],
      suitability: ['barley', 'oats', 'legumes'],
      ph_range: [6.5, 7.8],
      organic_matter: 'moderate'
    };
  },

  /**
   * Analyze erosion risk based on terrain features
   */
  analyzeErosionRisk: (slope, vegetationCover, soilType, rainfallIntensity) => {
    let riskScore = 0;
    
    // Slope factor (0-40 degrees)
    riskScore += Math.min(slope * 2.5, 100);
    
    // Vegetation cover factor (0-1, lower is worse)
    riskScore += (1 - vegetationCover) * 30;
    
    // Soil type factor
    const soilRiskFactors = {
      sand: 20,
      silt: 35,
      clay: 15,
      loam: 10
    };
    riskScore += soilRiskFactors[soilType] || 25;
    
    // Rainfall intensity factor
    riskScore += rainfallIntensity * 25;
    
    if (riskScore < 30) return { level: 'low', mitigation: ['maintain_vegetation'] };
    if (riskScore < 60) return { level: 'moderate', mitigation: ['contour_farming', 'cover_crops'] };
    return { level: 'high', mitigation: ['terracing', 'agroforestry', 'drainage_control'] };
  }
};

/**
 * Crop suitability analysis
 */
export const CropSuitabilityAnalyzer = {
  /**
   * Database of crop requirements
   */
  cropDatabase: {
    maize: {
      temperature_range: [18, 35],
      rainfall_range: [400, 800],
      soil_types: ['loam', 'clay', 'silt'],
      ph_range: [5.8, 7.0],
      elevation_max: 2000,
      growing_season: 120
    },
    wheat: {
      temperature_range: [12, 25],
      rainfall_range: [300, 600],
      soil_types: ['loam', 'clay'],
      ph_range: [6.0, 7.5],
      elevation_max: 3000,
      growing_season: 150
    },
    rice: {
      temperature_range: [20, 35],
      rainfall_range: [1000, 2000],
      soil_types: ['clay'],
      ph_range: [5.0, 7.0],
      elevation_max: 1500,
      growing_season: 110
    },
    soybeans: {
      temperature_range: [20, 30],
      rainfall_range: [450, 700],
      soil_types: ['loam', 'silt'],
      ph_range: [6.0, 7.0],
      elevation_max: 1800,
      growing_season: 100
    },
    groundnuts: {
      temperature_range: [25, 35],
      rainfall_range: [500, 1200],
      soil_types: ['sand', 'loam'],
      ph_range: [5.5, 7.0],
      elevation_max: 1000,
      growing_season: 90
    }
  },

  /**
   * Analyze crop suitability for given conditions
   */
  analyzeSuitability: (conditions, cropType) => {
    const crop = CropSuitabilityAnalyzer.cropDatabase[cropType];
    if (!crop) return { suitable: false, reason: 'Unknown crop type' };

    const { temperature, rainfall, soilType, ph, elevation } = conditions;
    
    let suitabilityScore = 100;
    let limitations = [];

    // Temperature check
    if (temperature < crop.temperature_range[0] || temperature > crop.temperature_range[1]) {
      suitabilityScore -= 30;
      limitations.push(`Temperature out of range (${crop.temperature_range[0]}-${crop.temperature_range[1]}°C)`);
    }

    // Rainfall check
    if (rainfall < crop.rainfall_range[0] || rainfall > crop.rainfall_range[1]) {
      suitabilityScore -= 25;
      limitations.push(`Rainfall out of range (${crop.rainfall_range[0]}-${crop.rainfall_range[1]}mm)`);
    }

    // Soil type check
    if (!crop.soil_types.includes(soilType)) {
      suitabilityScore -= 20;
      limitations.push(`Soil type not suitable (requires: ${crop.soil_types.join(', ')})`);
    }

    // pH check
    if (ph < crop.ph_range[0] || ph > crop.ph_range[1]) {
      suitabilityScore -= 15;
      limitations.push(`Soil pH out of range (${crop.ph_range[0]}-${crop.ph_range[1]})`);
    }

    // Elevation check
    if (elevation > crop.elevation_max) {
      suitabilityScore -= 10;
      limitations.push(`Elevation too high (max: ${crop.elevation_max}m)`);
    }

    return {
      suitable: suitabilityScore >= 60,
      suitabilityScore,
      limitations,
      recommendations: CropSuitabilityAnalyzer.getRecommendations(suitabilityScore, limitations)
    };
  },

  /**
   * Get management recommendations based on suitability analysis
   */
  getRecommendations: (score, limitations) => {
    const recommendations = [];

    if (score >= 80) {
      recommendations.push('Excellent conditions - proceed with standard practices');
    } else if (score >= 60) {
      recommendations.push('Good conditions with minor adjustments needed');
    } else {
      recommendations.push('Marginal conditions - significant management required');
    }

    // Specific recommendations based on limitations
    limitations.forEach(limitation => {
      if (limitation.includes('Temperature')) {
        recommendations.push('Consider variety selection or seasonal timing adjustments');
      }
      if (limitation.includes('Rainfall')) {
        recommendations.push('Implement irrigation or drainage systems');
      }
      if (limitation.includes('Soil type')) {
        recommendations.push('Soil amendment or alternative crop selection recommended');
      }
      if (limitation.includes('pH')) {
        recommendations.push('Apply lime (low pH) or sulfur (high pH) amendments');
      }
    });

    return recommendations;
  }
};

/**
 * Weather pattern analysis for agricultural planning
 */
export const WeatherPatternAnalyzer = {
  /**
   * Analyze seasonal weather patterns
   */
  analyzeSeasonalPattern: (weatherData) => {
    const seasons = {
      dry: { start: 5, end: 9 }, // May to September
      wet: { start: 10, end: 4 }  // October to April
    };

    const monthlyData = weatherData.reduce((acc, data) => {
      const month = data.timestamp.getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(data);
      return acc;
    }, {});

    return {
      drySeasonPattern: WeatherPatternAnalyzer.calculateSeasonStats(monthlyData, seasons.dry),
      wetSeasonPattern: WeatherPatternAnalyzer.calculateSeasonStats(monthlyData, seasons.wet),
      optimalPlantingWindows: WeatherPatternAnalyzer.identifyPlantingWindows(monthlyData),
      riskPeriods: WeatherPatternAnalyzer.identifyRiskPeriods(monthlyData)
    };
  },

  /**
   * Calculate statistics for a season
   */
  calculateSeasonStats: (monthlyData, season) => {
    const months = season.start <= season.end 
      ? Array.from({length: season.end - season.start + 1}, (_, i) => season.start + i)
      : [...Array.from({length: 12 - season.start}, (_, i) => season.start + i),
         ...Array.from({length: season.end + 1}, (_, i) => i)];

    const seasonData = months.flatMap(month => monthlyData[month] || []);
    
    if (seasonData.length === 0) return null;

    return {
      avgTemperature: seasonData.reduce((sum, d) => sum + d.temperature, 0) / seasonData.length,
      totalRainfall: seasonData.reduce((sum, d) => sum + d.precipitation, 0),
      avgHumidity: seasonData.reduce((sum, d) => sum + d.humidity, 0) / seasonData.length,
      avgWindSpeed: seasonData.reduce((sum, d) => sum + d.windSpeed, 0) / seasonData.length
    };
  },

  /**
   * Identify optimal planting windows
   */
  identifyPlantingWindows: (monthlyData) => {
    const windows = [];
    
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      const avgTemp = data.reduce((sum, d) => sum + d.temperature, 0) / data.length;
      const totalRain = data.reduce((sum, d) => sum + d.precipitation, 0);
      
      // Optimal conditions: temperature 20-30°C, rainfall 50-200mm
      if (avgTemp >= 20 && avgTemp <= 30 && totalRain >= 50 && totalRain <= 200) {
        windows.push({
          month: parseInt(month),
          monthName: new Date(2024, month, 1).toLocaleString('default', { month: 'long' }),
          avgTemperature: avgTemp,
          rainfall: totalRain,
          suitability: 'optimal'
        });
      }
    });

    return windows;
  },

  /**
   * Identify risk periods (drought, flooding, extreme temperatures)
   */
  identifyRiskPeriods: (monthlyData) => {
    const risks = [];

    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      const avgTemp = data.reduce((sum, d) => sum + d.temperature, 0) / data.length;
      const totalRain = data.reduce((sum, d) => sum + d.precipitation, 0);
      
      const monthName = new Date(2024, month, 1).toLocaleString('default', { month: 'long' });

      if (totalRain < 20) {
        risks.push({ month: parseInt(month), monthName, type: 'drought', severity: 'high' });
      }
      if (totalRain > 300) {
        risks.push({ month: parseInt(month), monthName, type: 'flooding', severity: 'moderate' });
      }
      if (avgTemp > 35) {
        risks.push({ month: parseInt(month), monthName, type: 'heat_stress', severity: 'high' });
      }
      if (avgTemp < 10) {
        risks.push({ month: parseInt(month), monthName, type: 'cold_stress', severity: 'moderate' });
      }
    });

    return risks;
  }
};

/**
 * Integrated terrain analysis for agricultural decision making
 */
export const AgriculturalTerrainAnalyzer = {
  /**
   * Comprehensive analysis of terrain for agricultural suitability
   */
  analyzeTerrainForAgriculture: (terrainData, weatherData, targetCrops = []) => {
    const { position, elevation, slope, aspect, drainageIndex } = terrainData;
    
    // Soil classification
    const precipitationLevel = weatherData.reduce((sum, d) => sum + d.precipitation, 0) / weatherData.length / 1000;
    const soilAnalysis = SoilClassifier.classifySoilType(elevation, slope, drainageIndex, precipitationLevel);
    
    // Erosion risk assessment
    const vegetationCover = 0.7; // This would come from satellite imagery in real implementation
    const avgRainfall = weatherData.reduce((sum, d) => sum + d.precipitation, 0) / weatherData.length;
    const erosionRisk = SoilClassifier.analyzeErosionRisk(slope, vegetationCover, soilAnalysis.type, avgRainfall / 100);
    
    // Weather pattern analysis
    const weatherPattern = WeatherPatternAnalyzer.analyzeSeasonalPattern(weatherData);
    
    // Crop suitability analysis
    const cropSuitability = {};
    const avgTemp = weatherData.reduce((sum, d) => sum + d.temperature, 0) / weatherData.length;
    const totalRainfall = weatherData.reduce((sum, d) => sum + d.precipitation, 0);
    
    const conditions = {
      temperature: avgTemp,
      rainfall: totalRainfall,
      soilType: soilAnalysis.type,
      ph: soilAnalysis.ph_range[0] + (soilAnalysis.ph_range[1] - soilAnalysis.ph_range[0]) * 0.5,
      elevation
    };

    // Analyze all crops in database if no specific targets
    const cropsToAnalyze = targetCrops.length > 0 ? targetCrops : Object.keys(CropSuitabilityAnalyzer.cropDatabase);
    
    cropsToAnalyze.forEach(crop => {
      cropSuitability[crop] = CropSuitabilityAnalyzer.analyzeSuitability(conditions, crop);
    });

    return {
      location: position,
      soilAnalysis,
      erosionRisk,
      weatherPattern,
      cropSuitability,
      overallSuitability: AgriculturalTerrainAnalyzer.calculateOverallSuitability(soilAnalysis, erosionRisk, cropSuitability),
      recommendations: AgriculturalTerrainAnalyzer.generateRecommendations(soilAnalysis, erosionRisk, cropSuitability, weatherPattern)
    };
  },

  /**
   * Calculate overall agricultural suitability score
   */
  calculateOverallSuitability: (soilAnalysis, erosionRisk, cropSuitability) => {
    let score = 70; // Base score

    // Soil quality factor
    if (soilAnalysis.type === 'loam') score += 20;
    else if (soilAnalysis.type === 'clay') score += 10;
    else if (soilAnalysis.type === 'silt') score += 5;
    // Sand gets no bonus but no penalty

    // Erosion risk factor
    if (erosionRisk.level === 'low') score += 10;
    else if (erosionRisk.level === 'moderate') score -= 5;
    else score -= 15;

    // Crop suitability factor
    const suitableCrops = Object.values(cropSuitability).filter(c => c.suitable).length;
    const totalCrops = Object.keys(cropSuitability).length;
    score += (suitableCrops / totalCrops) * 20;

    return Math.max(0, Math.min(100, score));
  },

  /**
   * Generate actionable recommendations
   */
  generateRecommendations: (soilAnalysis, erosionRisk, cropSuitability, weatherPattern) => {
    const recommendations = [];

    // Soil management
    recommendations.push({
      category: 'Soil Management',
      items: [
        `Primary soil type: ${soilAnalysis.type}`,
        `Consider crops suitable for ${soilAnalysis.type} soils: ${soilAnalysis.suitability.join(', ')}`,
        `Maintain soil pH between ${soilAnalysis.ph_range[0]}-${soilAnalysis.ph_range[1]}`
      ]
    });

    // Erosion control
    if (erosionRisk.level !== 'low') {
      recommendations.push({
        category: 'Erosion Control',
        items: erosionRisk.mitigation.map(m => m.replace(/_/g, ' ').toUpperCase())
      });
    }

    // Crop selection
    const suitableCrops = Object.entries(cropSuitability)
      .filter(([crop, analysis]) => analysis.suitable)
      .map(([crop]) => crop);
    
    if (suitableCrops.length > 0) {
      recommendations.push({
        category: 'Recommended Crops',
        items: suitableCrops.map(crop => crop.toUpperCase())
      });
    }

    // Seasonal planning
    if (weatherPattern.optimalPlantingWindows.length > 0) {
      recommendations.push({
        category: 'Planting Schedule',
        items: weatherPattern.optimalPlantingWindows.map(w => 
          `Optimal planting: ${w.monthName} (${w.avgTemperature.toFixed(1)}°C, ${w.rainfall.toFixed(0)}mm)`
        )
      });
    }

    return recommendations;
  }
};

export default {
  SoilClassifier,
  CropSuitabilityAnalyzer,
  WeatherPatternAnalyzer,
  AgriculturalTerrainAnalyzer
};
