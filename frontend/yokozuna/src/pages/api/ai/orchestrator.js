export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context, preferredModel } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Intelligent routing decision
    const routingDecision = determineRouting(message, context, preferredModel);
    
    console.log('AI Routing Decision:', routingDecision);

    // Route to appropriate model(s)
    const response = await routeToModel(message, context, routingDecision);

    res.status(200).json({
      content: response.content,
      routing: routingDecision,
      performance: response.performance,
      model: response.model,
      provider: response.provider
    });

  } catch (error) {
    console.error('AI Orchestrator Error:', error);
    
    // Fallback to basic response
    res.status(200).json({
      content: generateFallbackResponse(req.body.message),
      routing: { pattern: 'fallback', reason: 'api_error' },
      performance: { responseTime: 0, cached: false },
      model: 'fallback',
      provider: 'system'
    });
  }
}

function determineRouting(message, context, preferredModel) {
  // Check for available models
  const availableModels = [];
  
  // Check API keys
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const huggingfaceKey = process.env.HUGGINGFACE_API_KEY;
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  
  if (anthropicKey && anthropicKey !== 'your_anthropic_api_key_here') {
    availableModels.push('anthropic');
  }
  if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
    availableModels.push('openai');
  }
  if (huggingfaceKey && huggingfaceKey !== 'your_huggingface_api_key_here') {
    availableModels.push('huggingface');
  }
  
  // Check if Ollama is available
  availableModels.push('ollama'); // Always try Ollama as fallback
  
  // Determine routing pattern
  const messageLower = message.toLowerCase();
  
  // Domain-specific routing
  if (messageLower.includes('weather') || messageLower.includes('climate') || messageLower.includes('temperature')) {
    return {
      pattern: 'router_based',
      models: availableModels,
      primaryModel: preferredModel || (availableModels.includes('anthropic') ? 'anthropic' : availableModels[0]),
      domain: 'meteorology',
      synthesis: false
    };
  }
  
  if (messageLower.includes('coordinate') || messageLower.includes('latitude') || messageLower.includes('longitude')) {
    return {
      pattern: 'router_based',
      models: availableModels,
      primaryModel: preferredModel || (availableModels.includes('anthropic') ? 'anthropic' : availableModels[0]),
      domain: 'geography',
      synthesis: false
    };
  }
  
  // Complex analysis requires multiple models
  if (messageLower.includes('analyze') || messageLower.includes('compare') || messageLower.includes('relationship')) {
    return {
      pattern: 'mixture_of_experts',
      models: availableModels.slice(0, 2), // Use top 2 available models
      primaryModel: preferredModel || (availableModels.includes('anthropic') ? 'anthropic' : availableModels[0]),
      synthesis: true
    };
  }
  
  // Default routing
  return {
    pattern: 'router_based',
    models: availableModels,
    primaryModel: preferredModel || (availableModels.includes('anthropic') ? 'anthropic' : availableModels[0]),
    synthesis: false
  };
}

async function routeToModel(message, context, routingDecision) {
  const startTime = Date.now();
  
  try {
    const { primaryModel, models, pattern, synthesis } = routingDecision;
    
    // Build domain-aware system prompt
    const systemPrompt = buildSystemPrompt(context, routingDecision.domain);
    
    let response;
    
    switch (pattern) {
      case 'mixture_of_experts':
        response = await callMultipleModels(message, systemPrompt, models);
        break;
      case 'router_based':
      default:
        response = await callSingleModel(message, systemPrompt, primaryModel);
        break;
    }
    
    return {
      content: response.content,
      model: response.model,
      provider: response.provider,
      performance: {
        responseTime: Date.now() - startTime,
        cached: false
      }
    };
    
  } catch (error) {
    console.error(`Error in model routing:`, error);
    
    // Try fallback models
    const fallbackModels = routingDecision.models.filter(m => m !== routingDecision.primaryModel);
    
    for (const fallbackModel of fallbackModels) {
      try {
        const systemPrompt = buildSystemPrompt(context, routingDecision.domain);
        const response = await callSingleModel(message, systemPrompt, fallbackModel);
        return {
          content: response.content,
          model: response.model,
          provider: response.provider,
          performance: {
            responseTime: Date.now() - startTime,
            cached: false
          }
        };
      } catch (fallbackError) {
        console.warn(`Fallback model ${fallbackModel} also failed:`, fallbackError);
        continue;
      }
    }
    
    // If all models fail, return fallback response
    throw new Error('All AI models failed');
  }
}

async function callSingleModel(message, systemPrompt, model) {
  switch (model) {
    case 'anthropic':
      return await callAnthropicModel(message, systemPrompt);
    case 'openai':
      return await callOpenAIModel(message, systemPrompt);
    case 'huggingface':
      return await callHuggingFaceModel(message, systemPrompt);
    case 'ollama':
      return await callOllamaModel(message, systemPrompt);
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}

async function callMultipleModels(message, systemPrompt, models) {
  const responses = await Promise.allSettled(
    models.map(model => callSingleModel(message, systemPrompt, model))
  );
  
  const successful = responses
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  
  if (successful.length === 0) {
    throw new Error('All models failed in mixture of experts');
  }
  
  // Simple synthesis - combine responses
  const combined = successful.map(r => r.content).join('\n\n---\n\n');
  
  return {
    content: combined,
    model: successful.map(r => r.model).join(' + '),
    provider: 'ensemble'
  };
}

function buildSystemPrompt(context, domain) {
  const basePrompt = `You are an expert AI assistant for the Buhera-West Environmental Intelligence Platform. 
You provide accurate, helpful responses about weather, climate, geography, and environmental data.`;
  
  const domainPrompts = {
    meteorology: `You specialize in weather and climate analysis. Provide detailed meteorological insights.`,
    geography: `You specialize in geographical analysis and coordinate systems. Help with location-based queries.`,
    agriculture: `You specialize in agricultural and environmental analysis for Southern African regions.`,
    general: `You provide general assistance across all environmental and geographical topics.`
  };
  
  const domainPrompt = domainPrompts[domain] || domainPrompts.general;
  
  let contextPrompt = '';
  if (context) {
    contextPrompt = `\nContext: User is currently on ${context.pageContext || 'the platform'}.`;
    if (context.weatherData) {
      contextPrompt += `\nCurrent weather data is available for analysis.`;
    }
  }
  
  return basePrompt + '\n' + domainPrompt + contextPrompt;
}

async function callAnthropicModel(message, systemPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
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
  return {
    content: data.content[0].text,
    model: 'claude-3-sonnet',
    provider: 'anthropic'
  };
}

async function callOpenAIModel(message, systemPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
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
  return {
    content: data.choices[0].message.content,
    model: 'gpt-4',
    provider: 'openai'
  };
}

async function callHuggingFaceModel(message, systemPrompt) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
    throw new Error('Hugging Face API key not configured');
  }

  const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: `${systemPrompt}\n\nUser: ${message}\nAssistant:`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Hugging Face API error: ${error}`);
  }

  const data = await response.json();
  return {
    content: data[0]?.generated_text || 'No response generated',
    model: 'DialoGPT-medium',
    provider: 'huggingface'
  };
}

async function callOllamaModel(message, systemPrompt) {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.1:8b';
  
  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: `${systemPrompt}\n\nUser: ${message}\nAssistant:`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.response,
      model: ollamaModel,
      provider: 'ollama'
    };
  } catch (error) {
    console.warn('Ollama not available, skipping:', error.message);
    throw new Error('Ollama service not available');
  }
}

function generateFallbackResponse(message) {
  const fallbackResponses = {
    weather: "I understand you're asking about weather. While I'm currently running in fallback mode without access to advanced AI models, I can provide general weather information. For more detailed and accurate responses, please ensure your API keys are properly configured in your environment variables.",
    coordinate: "I understand your question about coordinates. While I'm currently running in fallback mode without access to advanced AI models, I can provide general information about coordinate systems. For more detailed and accurate responses, please ensure your API keys are properly configured in your environment variables.",
    default: "I understand your question. While I'm currently running in fallback mode without access to advanced AI models, I can provide general information. For more detailed and accurate responses, please ensure your API keys are properly configured in your environment variables."
  };
  
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('weather') || messageLower.includes('climate')) {
    return fallbackResponses.weather;
  }
  
  if (messageLower.includes('coordinate') || messageLower.includes('latitude') || messageLower.includes('longitude')) {
    return fallbackResponses.coordinate;
  }
  
  return fallbackResponses.default;
} 