import { useState, useCallback, useContext, createContext } from 'react';
import { useRouter } from 'next/router';

// Context for sharing AI state across components
const AIContext = createContext();

export const AIProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentContext, setCurrentContext] = useState({});

  return (
    <AIContext.Provider value={{
      isLoading,
      setIsLoading,
      conversationHistory,
      setConversationHistory,
      currentContext,
      setCurrentContext
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAIOrchestrator = () => {
  const router = useRouter();
  const aiContext = useContext(AIContext);
  
  // Create fallback state when not within AIProvider
  const [fallbackIsLoading, setFallbackIsLoading] = useState(false);
  const [fallbackConversationHistory, setFallbackConversationHistory] = useState([]);
  const [fallbackCurrentContext, setFallbackCurrentContext] = useState({});
  
  // Use context or fallback
  const effectiveContext = aiContext || {
    isLoading: fallbackIsLoading,
    setIsLoading: setFallbackIsLoading,
    conversationHistory: fallbackConversationHistory,
    setConversationHistory: setFallbackConversationHistory,
    currentContext: fallbackCurrentContext,
    setCurrentContext: setFallbackCurrentContext
  };

  const {
    isLoading,
    setIsLoading,
    conversationHistory,
    setConversationHistory,
    currentContext,
    setCurrentContext
  } = effectiveContext;

  // Get current page context
  const getCurrentContext = useCallback(() => {
    const path = router.asPath;
    const page = router.pathname;
    
    let dataType = 'general';
    let contextDescription = '';
    
    if (path.includes('weather')) {
      dataType = 'weather';
      contextDescription = 'Weather and atmospheric data analysis';
    } else if (path.includes('agriculture')) {
      dataType = 'agricultural';
      contextDescription = 'Agricultural monitoring and crop analysis';
    } else if (path.includes('geology')) {
      dataType = 'geological';
      contextDescription = 'Geological and terrain analysis';
    } else if (path.includes('ocean')) {
      dataType = 'oceanic';
      contextDescription = 'Oceanographic and marine data';
    } else if (path.includes('orbital')) {
      dataType = 'orbital';
      contextDescription = 'Satellite and orbital mechanics';
    } else if (path.includes('cosmology')) {
      dataType = 'cosmological';
      contextDescription = 'Solar system and space data';
    }

    return {
      currentPage: page,
      currentPath: path,
      dataType,
      contextDescription,
      timestamp: new Date().toISOString(),
      ...currentContext
    };
  }, [router, currentContext]);

  // Main query function
  const queryAI = useCallback(async (
    query, 
    options = {}
  ) => {
    const {
      weatherData = null,
      additionalContext = {},
      preferredModel = 'anthropic',
      taskType = 'general',
      includeHistory = true
    } = options;

    setIsLoading(true);

    try {
      const contextData = getCurrentContext();
      
      const requestBody = {
        query,
        context: {
          ...contextData,
          ...additionalContext
        },
        weatherData,
        currentPage: contextData.currentPage,
        dataType: contextData.dataType,
        preferredModel,
        taskType,
        conversationHistory: includeHistory ? conversationHistory.slice(-5) : [] // Last 5 exchanges
      };

      const response = await fetch('/api/ai/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Update conversation history
      const newExchange = {
        id: Date.now(),
        query,
        response: result,
        timestamp: new Date().toISOString(),
        context: contextData
      };
      
      setConversationHistory(prev => [...prev, newExchange]);

      return result;
    } catch (error) {
      console.error('AI Query Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentContext, conversationHistory, setIsLoading, setConversationHistory]);

  // Explain complex data function
  const explainData = useCallback(async (
    dataKey, 
    dataValue, 
    dataContext = {}
  ) => {
    const query = `Please explain what "${dataKey}" means and why the value "${dataValue}" is significant in this context. Make it understandable for someone without technical expertise.`;
    
    return queryAI(query, {
      additionalContext: {
        explainMode: true,
        dataKey,
        dataValue,
        ...dataContext
      }
    });
  }, [queryAI]);

  // Suggest visualizations function
  const suggestVisualization = useCallback(async (
    dataSet, 
    currentVisualization = null
  ) => {
    const query = `Given this data set, what would be the most effective way to visualize it? ${currentVisualization ? `Currently using: ${currentVisualization}` : ''}`;
    
    return queryAI(query, {
      additionalContext: {
        visualizationMode: true,
        dataSet: typeof dataSet === 'object' ? JSON.stringify(dataSet) : dataSet,
        currentVisualization
      }
    });
  }, [queryAI]);

  // Update context function
  const updateContext = useCallback((newContext) => {
    setCurrentContext(prev => ({
      ...prev,
      ...newContext
    }));
  }, [setCurrentContext]);

  // Weather forecast analysis with specialized models
  const analyzeWeatherForecast = useCallback(async (
    forecastData,
    location = null
  ) => {
    const query = `Analyze this weather forecast data and provide insights about patterns, anomalies, and recommendations.`;
    
    return queryAI(query, {
      preferredModel: 'huggingface',
      taskType: 'forecasting',
      weatherData: forecastData,
      additionalContext: {
        location,
        analysisType: 'forecast',
        expectedOutput: 'weather_analysis'
      }
    });
  }, [queryAI]);

  // Data summarization using BART models
  const summarizeWeatherData = useCallback(async (
    dataSet,
    summaryType = 'brief'
  ) => {
    const query = `Summarize the key insights from this weather data in a ${summaryType} format.`;
    
    return queryAI(query, {
      preferredModel: 'huggingface',
      taskType: 'summarization',
      weatherData: dataSet,
      additionalContext: {
        summaryType,
        expectedLength: summaryType === 'brief' ? 'short' : 'detailed'
      }
    });
  }, [queryAI]);

  // Ensemble query for complex analysis
  const getEnsembleInsight = useCallback(async (
    query,
    weatherData = null
  ) => {
    return queryAI(query, {
      preferredModel: 'ensemble',
      taskType: 'analysis',
      weatherData,
      additionalContext: {
        analysisMode: 'comprehensive',
        requireMultiplePerspectives: true
      }
    });
  }, [queryAI]);

  // Smart model selection based on query type
  const smartQuery = useCallback(async (
    query,
    weatherData = null
  ) => {
    // Analyze query to determine best approach
    const queryLower = query.toLowerCase();
    let preferredModel = 'anthropic';
    let taskType = 'general';
    
    if (queryLower.includes('forecast') || queryLower.includes('predict')) {
      preferredModel = 'huggingface';
      taskType = 'forecasting';
    } else if (queryLower.includes('summarize') || queryLower.includes('overview')) {
      preferredModel = 'huggingface';
      taskType = 'summarization';
    } else if (queryLower.includes('analyze') || queryLower.includes('pattern')) {
      preferredModel = 'ensemble';
      taskType = 'analysis';
    } else if (queryLower.includes('explain') || queryLower.includes('what') || queryLower.includes('how')) {
      preferredModel = 'anthropic';
      taskType = 'general';
    }
    
    return queryAI(query, {
      preferredModel,
      taskType,
      weatherData,
      additionalContext: {
        autoSelected: true,
        reasoning: `Selected ${preferredModel} for ${taskType} based on query analysis`
      }
    });
  }, [queryAI]);

  // Clear conversation function
  const clearConversation = useCallback(() => {
    setConversationHistory([]);
  }, [setConversationHistory]);

  return {
    queryAI,
    explainData,
    suggestVisualization,
    analyzeWeatherForecast,
    summarizeWeatherData,
    getEnsembleInsight,
    smartQuery,
    updateContext,
    clearConversation,
    isLoading,
    conversationHistory,
    currentContext: getCurrentContext()
  };
}; 