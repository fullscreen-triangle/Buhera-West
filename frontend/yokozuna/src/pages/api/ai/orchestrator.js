export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context, modelType, workingMemory } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Enhance context with working memory
    const enhancedContext = buildEnhancedContext(context, workingMemory);
    
    // Route to appropriate model based on Combine Harvester methodology
    const response = await routeToModel(message, enhancedContext, modelType);
    
    res.status(200).json({
      content: response,
      timestamp: new Date().toISOString(),
      model: modelType,
      context: enhancedContext
    });
    
  } catch (error) {
    console.error('AI Orchestrator Error:', error);
    res.status(500).json({ 
      error: 'Failed to process AI request',
      details: error.message 
    });
  }
}

function buildEnhancedContext(context, workingMemory) {
  const enhanced = {
    ...context,
    workingMemory: {
      conversationCount: workingMemory?.conversations?.length || 0,
      pageVisits: workingMemory?.pageContext ? Object.keys(workingMemory.pageContext).length : 0,
      sessionActive: !!workingMemory?.sessionData,
      recentTopics: extractRecentTopics(workingMemory?.conversations || [])
    }
  };

  // Add page-specific context
  if (context?.currentPage) {
    enhanced.pageType = classifyPageType(context.currentPage);
    enhanced.domainFocus = getDomainFocus(context.currentPage);
  }

  return enhanced;
}

function extractRecentTopics(conversations) {
  if (!conversations || conversations.length === 0) return [];
  
  const recentConversations = conversations.slice(-5);
  const topics = new Set();
  
  recentConversations.forEach(conv => {
    if (conv.content) {
      const words = conv.content.toLowerCase().split(/\s+/);
      const topicWords = words.filter(word => 
        word.length > 4 && 
        !['what', 'how', 'why', 'when', 'where', 'the', 'and', 'but', 'for'].includes(word)
      );
      topicWords.slice(0, 3).forEach(topic => topics.add(topic));
    }
  });
  
  return Array.from(topics).slice(0, 10);
}

function classifyPageType(pathname) {
  const pageClassifications = {
    '/weather': 'meteorological',
    '/agriculture': 'agricultural',
    '/geology': 'geological',
    '/oceanoegraphy': 'oceanographic',
    '/orbital': 'astronomical',
    '/cosmology': 'cosmological',
    '/': 'dashboard'
  };
  
  for (const [path, type] of Object.entries(pageClassifications)) {
    if (pathname.includes(path)) return type;
  }
  
  return 'general';
}

function getDomainFocus(pathname) {
  const domainMap = {
    '/weather': ['meteorology', 'atmospheric_science', 'climatology'],
    '/agriculture': ['agriculture', 'soil_science', 'crop_management'],
    '/geology': ['geology', 'mineralogy', 'earth_science'],
    '/oceanoegraphy': ['oceanography', 'marine_science', 'hydrology'],
    '/orbital': ['astronomy', 'orbital_mechanics', 'space_science'],
    '/cosmology': ['cosmology', 'astrophysics', 'astronomy']
  };
  
  for (const [path, domains] of Object.entries(domainMap)) {
    if (pathname.includes(path)) return domains;
  }
  
  return ['general'];
}

async function routeToModel(message, context, preferredModel = 'anthropic') {
  // Use environment variables for API keys
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  
  // Build domain-aware system prompt
  const systemPrompt = buildSystemPrompt(context);
  
  try {
    switch (preferredModel) {
      case 'anthropic':
        return await callAnthropicModel(message, systemPrompt, anthropicKey);
      case 'openai':
        return await callOpenAIModel(message, systemPrompt, openaiKey);
      case 'huggingface':
        return await callHuggingFaceModel(message, systemPrompt);
      default:
        // Fallback to best available model
        if (anthropicKey) {
          return await callAnthropicModel(message, systemPrompt, anthropicKey);
        } else if (openaiKey) {
          return await callOpenAIModel(message, systemPrompt, openaiKey);
        } else {
          return await callHuggingFaceModel(message, systemPrompt);
        }
    }
  } catch (error) {
    console.error(`Error with ${preferredModel} model:`, error);
    
    // Intelligent fallback based on Combine Harvester principles
    if (preferredModel !== 'anthropic' && anthropicKey) {
      return await callAnthropicModel(message, systemPrompt, anthropicKey);
    } else if (preferredModel !== 'openai' && openaiKey) {
      return await callOpenAIModel(message, systemPrompt, openaiKey);
    } else {
      return await callHuggingFaceModel(message, systemPrompt);
    }
  }
}

function buildSystemPrompt(context) {
  let systemPrompt = `You are an advanced AI assistant specializing in environmental intelligence and data analysis. You have access to working memory and context about the user's current session.

Current Context:
- Page: ${context.currentPage || 'Unknown'}
- Page Type: ${context.pageType || 'general'}
- Domain Focus: ${context.domainFocus?.join(', ') || 'general'}
- Session: ${context.workingMemory?.conversationCount || 0} messages, ${context.workingMemory?.pageVisits || 0} pages visited
- Recent Topics: ${context.workingMemory?.recentTopics?.join(', ') || 'none'}

Your capabilities include:
- Weather and atmospheric analysis
- Agricultural and soil science insights
- Geological and mineralogical knowledge
- Oceanographic and marine science
- Environmental data interpretation
- Spatial and temporal analysis

Always provide accurate, contextually relevant responses. If you're unsure about something, say so. Use the working memory context to provide continuity in conversations.`;

  // Add domain-specific enhancements
  if (context.domainFocus) {
    context.domainFocus.forEach(domain => {
      switch (domain) {
        case 'meteorology':
          systemPrompt += `\n\nMeteorology Focus: Pay special attention to weather patterns, atmospheric conditions, forecasting accuracy, and climate analysis.`;
          break;
        case 'agriculture':
          systemPrompt += `\n\nAgriculture Focus: Emphasize crop management, soil conditions, irrigation, and sustainable farming practices.`;
          break;
        case 'geology':
          systemPrompt += `\n\nGeology Focus: Focus on geological structures, mineral composition, earth processes, and subsurface analysis.`;
          break;
        case 'oceanography':
          systemPrompt += `\n\nOceanography Focus: Emphasize ocean currents, marine ecosystems, coastal processes, and water quality.`;
          break;
      }
    });
  }

  return systemPrompt;
}

async function callAnthropicModel(message, systemPrompt, apiKey) {
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function callOpenAIModel(message, systemPrompt, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callHuggingFaceModel(message, systemPrompt) {
  // Fallback to a simple response when no API keys are available
  const contextAwareResponse = generateContextAwareResponse(message, systemPrompt);
  return contextAwareResponse;
}

function generateContextAwareResponse(message, systemPrompt) {
  // This is a fallback when no API keys are configured
  // In a real implementation, you would call HuggingFace API here
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('weather') || lowerMessage.includes('temperature') || lowerMessage.includes('forecast')) {
    return `I understand you're asking about weather-related information. While I don't have access to real-time weather data in this fallback mode, I can explain that weather patterns are influenced by atmospheric pressure, temperature gradients, and moisture content. For accurate weather information, please ensure your API keys are configured.`;
  }
  
  if (lowerMessage.includes('agriculture') || lowerMessage.includes('crop') || lowerMessage.includes('farming')) {
    return `Your agricultural inquiry is noted. Agriculture depends on many factors including soil quality, climate conditions, water availability, and proper crop management. Modern precision agriculture uses data-driven approaches to optimize yields while maintaining sustainability.`;
  }
  
  if (lowerMessage.includes('geology') || lowerMessage.includes('rock') || lowerMessage.includes('mineral')) {
    return `Geological questions require understanding of Earth's structure and processes. Geological formations tell stories of Earth's history through rock layers, mineral compositions, and structural features. Different geological processes create distinct patterns that can be analyzed for resource exploration and hazard assessment.`;
  }
  
  if (lowerMessage.includes('ocean') || lowerMessage.includes('marine') || lowerMessage.includes('sea')) {
    return `Ocean systems are complex, involving currents, temperature gradients, salinity variations, and marine ecosystems. Ocean currents like the Benguela and Agulhas currents around Southern Africa play crucial roles in regional climate and marine biodiversity.`;
  }
  
  return `I understand your question about "${message}". While I'm currently running in fallback mode without access to advanced AI models, I can provide general information. For more detailed and accurate responses, please ensure your API keys are properly configured in your environment variables.`;
} 