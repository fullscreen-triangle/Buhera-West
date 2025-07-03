import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { backgroundDistillation } from '../services/backgroundDistillation';

// Global AI Context with Working Memory and Intelligent Model Selection
const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [workingMemory, setWorkingMemory] = useState({
    conversations: [],
    pageContext: {},
    domainKnowledge: {},
    userPreferences: {},
    sessionData: {}
  });
  const [modelPerformance, setModelPerformance] = useState({
    anthropic: { accuracy: 0.85, speed: 0.7, coherence: 0.9 },
    openai: { accuracy: 0.82, speed: 0.8, coherence: 0.85 },
    huggingface: { accuracy: 0.75, speed: 0.9, coherence: 0.8 }
  });

  // Combine Harvester Model Router
  const routeQuery = useCallback((query, context = {}) => {
    const domains = analyzeDomains(query, context);
    const complexity = analyzeComplexity(query);
    
    // Multi-criteria decision based on Combine Harvester patterns
    if (domains.length > 2 || complexity === 'high') {
      return {
        pattern: 'mixture_of_experts',
        models: domains.map(d => d.model),
        primaryModel: domains[0]?.model || 'anthropic',
        synthesis: true
      };
    } else if (domains.length === 2) {
      return {
        pattern: 'sequential_chaining',
        models: domains.map(d => d.model),
        primaryModel: domains[0]?.model || 'anthropic',
        synthesis: true
      };
    } else if (domains.length === 1) {
      return {
        pattern: 'router_based',
        models: [domains[0].model],
        primaryModel: domains[0].model,
        synthesis: false
      };
    } else {
      return {
        pattern: 'system_prompt',
        models: ['anthropic'],
        primaryModel: 'anthropic',
        synthesis: false
      };
    }
  }, []);

  // Domain Analysis (inspired by Combine Harvester)
  const analyzeDomains = useCallback((query, context) => {
    const domainPatterns = {
      weather: {
        keywords: ['weather', 'temperature', 'humidity', 'precipitation', 'forecast', 'climate'],
        model: 'anthropic',
        confidence: 0.9
      },
      agriculture: {
        keywords: ['crop', 'farming', 'soil', 'irrigation', 'harvest', 'agriculture'],
        model: 'anthropic',
        confidence: 0.85
      },
      geology: {
        keywords: ['geology', 'rock', 'mineral', 'seismic', 'geological', 'underground'],
        model: 'anthropic',
        confidence: 0.9
      },
      oceanography: {
        keywords: ['ocean', 'current', 'marine', 'benguela', 'agulhas', 'sea'],
        model: 'anthropic',
        confidence: 0.85
      },
      ai_technical: {
        keywords: ['ai', 'model', 'algorithm', 'machine learning', 'neural', 'api'],
        model: 'openai',
        confidence: 0.8
      },
      data_analysis: {
        keywords: ['chart', 'data', 'analysis', 'visualization', 'statistics', 'trends'],
        model: 'huggingface',
        confidence: 0.75
      }
    };

    const detectedDomains = [];
    const queryLower = query.toLowerCase();
    const contextString = JSON.stringify(context).toLowerCase();
    
    for (const [domain, config] of Object.entries(domainPatterns)) {
      const keywordMatches = config.keywords.filter(keyword => 
        queryLower.includes(keyword) || contextString.includes(keyword)
      );
      
      if (keywordMatches.length > 0) {
        const confidence = (keywordMatches.length / config.keywords.length) * config.confidence;
        detectedDomains.push({
          domain,
          model: config.model,
          confidence,
          keywords: keywordMatches
        });
      }
    }

    return detectedDomains
      .sort((a, b) => b.confidence - a.confidence)
      .filter(d => d.confidence > 0.3)
      .slice(0, 3);
  }, []);

  // Complexity Analysis
  const analyzeComplexity = useCallback((query) => {
    const complexityIndicators = {
      high: ['compare', 'analyze', 'integrate', 'combine', 'relationship', 'optimize', 'complex'],
      medium: ['explain', 'describe', 'calculate', 'predict', 'estimate'],
      low: ['what', 'when', 'where', 'simple', 'basic']
    };

    const queryLower = query.toLowerCase();
    
    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => queryLower.includes(indicator))) {
        return level;
      }
    }
    
    return query.length > 100 ? 'high' : 'medium';
  }, []);

  // Working Memory Management
  const updateWorkingMemory = useCallback((type, data) => {
    setWorkingMemory(prev => ({
      ...prev,
      [type]: typeof data === 'function' ? data(prev[type]) : data,
      lastUpdated: Date.now()
    }));
  }, []);

  const addToConversation = useCallback((message) => {
    updateWorkingMemory('conversations', prev => [
      ...prev.slice(-20),
      {
        ...message,
        timestamp: Date.now(),
        pageContext: window.location.pathname,
        sessionId: getSessionId()
      }
    ]);
  }, [updateWorkingMemory]);

  const updatePageContext = useCallback((pageData) => {
    updateWorkingMemory('pageContext', prev => ({
      ...prev,
      [window.location.pathname]: {
        ...pageData,
        timestamp: Date.now(),
        visitCount: (prev[window.location.pathname]?.visitCount || 0) + 1
      }
    }));
  }, [updateWorkingMemory]);

  // Session Management
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('ai_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ai_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Enhanced query function
  const query = useCallback(async (userQuery, options = {}) => {
    const startTime = Date.now();
    
    try {
      addToConversation({
        role: 'user',
        content: userQuery,
        type: 'query'
      });

      const currentPageContext = workingMemory.pageContext[window.location.pathname] || {};
      const recentConversations = workingMemory.conversations.slice(-5);

      const routing = routeQuery(userQuery, {
        pageContext: currentPageContext,
        conversations: recentConversations,
        userPreferences: workingMemory.userPreferences,
        ...options
      });

      console.log('🧠 AI Routing Decision:', routing);

      const response = await callAIModel(routing.primaryModel, {
        userQuery,
        context: {
          currentPage: window.location.pathname,
          pageData: currentPageContext,
          conversationHistory: recentConversations,
          routing: routing,
          timestamp: new Date().toISOString()
        }
      });

      const endTime = Date.now();
      
      addToConversation({
        role: 'assistant',
        content: response.content,
        type: 'response',
        routing: routing,
        performance: {
          responseTime: endTime - startTime,
          pattern: routing.pattern,
          models: routing.models
        }
      });

      return {
        ...response,
        routing,
        workingMemory: workingMemory
      };

    } catch (error) {
      console.error('AI Query Error:', error);
      
      addToConversation({
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        type: 'error',
        error: error.message
      });

      return {
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        error: error.message,
        routing: null
      };
    }
  }, [addToConversation, routeQuery, workingMemory]);

  // Call AI Model
  const callAIModel = useCallback(async (modelType, prompt) => {
    const response = await fetch('/api/ai/orchestrator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt.userQuery,
        context: prompt.context,
        modelType,
        workingMemory: workingMemory
      })
    });

    if (!response.ok) throw new Error(`AI API Error: ${response.statusText}`);
    return await response.json();
  }, [workingMemory]);

  // Load working memory from localStorage
  useEffect(() => {
    try {
      const savedMemory = localStorage.getItem('ai_working_memory');
      if (savedMemory) {
        const parsed = JSON.parse(savedMemory);
        const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (parsed.lastUpdated && parsed.lastUpdated > dayAgo) {
          setWorkingMemory(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch (error) {
      console.warn('Failed to load working memory:', error);
    }
  }, []);

  // Save working memory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ai_working_memory', JSON.stringify(workingMemory));
    } catch (error) {
      console.warn('Failed to save working memory:', error);
    }
  }, [workingMemory]);

  const value = {
    isAIOpen,
    setIsAIOpen,
    query,
    workingMemory,
    updateWorkingMemory,
    addToConversation,
    updatePageContext,
    modelPerformance,
    routeQuery,
    getSessionId,
    clearMemory: () => setWorkingMemory({
      conversations: [],
      pageContext: {},
      domainKnowledge: {},
      userPreferences: {},
      sessionData: {}
    })
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}; 