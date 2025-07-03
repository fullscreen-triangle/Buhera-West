import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../contexts/AIContext';
import { backgroundDistillation } from '../../services/backgroundDistillation';
import DistillationMonitor from './DistillationMonitor';

const AIAssistant = () => {
  const {
    isAIOpen,
    setIsAIOpen,
    query,
    workingMemory,
    updatePageContext,
    modelPerformance,
    clearMemory
  } = useAI();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDistillationMonitor, setShowDistillationMonitor] = useState(false);
  const [distillationStatus, setDistillationStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync with working memory conversations
  useEffect(() => {
    if (workingMemory.conversations.length > 0) {
      const formattedMessages = workingMemory.conversations
        .filter(conv => conv.pageContext === window.location.pathname)
        .map(conv => ({
          id: conv.timestamp,
          text: conv.content,
          sender: conv.role === 'user' ? 'user' : 'ai',
          timestamp: conv.timestamp,
          routing: conv.routing,
          performance: conv.performance
        }));
      setMessages(formattedMessages);
    }
  }, [workingMemory.conversations]);

  // Update page context when component mounts
  useEffect(() => {
    updatePageContext({
      path: window.location.pathname,
      title: document.title,
      components: ['AIAssistant'],
      timestamp: Date.now()
    });
  }, [updatePageContext]);

  // Monitor distillation status
  useEffect(() => {
    const updateDistillationStatus = () => {
      const status = backgroundDistillation.getDistillationStatus();
      setDistillationStatus(status);
    };

    updateDistillationStatus();
    const interval = setInterval(updateDistillationStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await query(inputValue, {
        pageContext: window.location.pathname,
        userIntent: analyzeUserIntent(inputValue)
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.content,
        sender: 'ai',
        timestamp: Date.now(),
        routing: response.routing,
        performance: response.performance
      };

      setMessages(prev => [...prev, aiMessage]);

      // Record interaction for background distillation learning
      backgroundDistillation.recordUserInteraction(
        inputValue,
        response,
        response.routing,
        null // userFeedback - could be added later with thumbs up/down
      );
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: Date.now(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInputValue('');
    }
  };

  const analyzeUserIntent = (message) => {
    const intents = {
      question: ['what', 'how', 'why', 'when', 'where', 'who', '?'],
      request: ['please', 'can you', 'could you', 'would you'],
      analysis: ['analyze', 'compare', 'evaluate', 'assess'],
      explanation: ['explain', 'describe', 'tell me about'],
      help: ['help', 'assist', 'support']
    };

    const messageLower = message.toLowerCase();
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        return intent;
      }
    }
    return 'general';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getRoutingBadge = (routing) => {
    if (!routing) return null;
    
    const badges = {
      'mixture_of_experts': { color: 'bg-purple-500', label: 'MoE' },
      'sequential_chaining': { color: 'bg-blue-500', label: 'Chain' },
      'router_based': { color: 'bg-green-500', label: 'Router' },
      'system_prompt': { color: 'bg-orange-500', label: 'System' }
    };

    const badge = badges[routing.pattern];
    if (!badge) return null;

    return (
      <span className={`inline-block px-2 py-1 text-xs rounded-full text-white ${badge.color} ml-2`}>
        {badge.label}
      </span>
    );
  };

  const getPerformanceIndicator = (performance) => {
    if (!performance) return null;
    
    const responseTime = performance.responseTime;
    let color = 'text-green-500';
    if (responseTime > 5000) color = 'text-red-500';
    else if (responseTime > 3000) color = 'text-yellow-500';

    return (
      <span className={`text-xs ${color} ml-2`}>
        {(responseTime / 1000).toFixed(1)}s
      </span>
    );
  };

  if (!isAIOpen) {
    return (
      <button
        onClick={() => setIsAIOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
      >
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          AI
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200/50">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-gray-800">AI Assistant</h3>
          <span className="text-xs text-gray-500">
            {workingMemory.conversations.length} msgs
          </span>
          {distillationStatus?.isRunning && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600">Learning</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDistillationMonitor(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Background Knowledge Distillation"
          >
            <span className="text-sm">🧠</span>
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Advanced Info"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setIsAIOpen(false)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Advanced Info Panel */}
      {showAdvanced && (
        <div className="p-3 bg-gray-50/80 border-b border-gray-200/50 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Page:</span> {window.location.pathname}
            </div>
            <div>
              <span className="font-medium">Session:</span> {workingMemory.sessionData?.id?.slice(-6) || 'New'}
            </div>
            <div>
              <span className="font-medium">Memory:</span> {workingMemory.conversations.length}/20
            </div>
            <div>
              <span className="font-medium">Models:</span> 
              <div className="flex space-x-1 mt-1">
                {Object.entries(modelPerformance).map(([model, perf]) => (
                  <div key={model} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-1 ${
                      perf.accuracy > 0.8 ? 'bg-green-500' : 
                      perf.accuracy > 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-xs">{model.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={clearMemory}
              className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
            >
              Clear Memory
            </button>
            <button
              onClick={() => updatePageContext({ forceRefresh: true })}
              className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
            >
              Refresh Context
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm">Hi! I'm your AI assistant.</p>
            <p className="text-xs mt-1">I use intelligent routing to give you the best answers.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : message.error
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  <div className="flex items-center">
                    {getRoutingBadge(message.routing)}
                    {getPerformanceIndicator(message.performance)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200/50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>Powered by Combine Harvester</span>
          <span>{inputValue.length}/500</span>
        </div>
      </div>

      {/* Background Distillation Monitor */}
      <DistillationMonitor 
        isVisible={showDistillationMonitor}
        onClose={() => setShowDistillationMonitor(false)}
      />
    </div>
  );
};

export default AIAssistant; 