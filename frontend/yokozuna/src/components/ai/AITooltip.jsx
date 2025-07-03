import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIOrchestrator } from '../Hooks/useAIOrchestrator';

const AITooltip = ({ 
  children, 
  dataKey, 
  dataValue, 
  dataContext = {},
  delay = 1000,
  position = 'top',
  className = "",
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const { explainData } = useAIOrchestrator();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(async () => {
      setIsVisible(true);
      
      if (!explanation && !isLoading) {
        setIsLoading(true);
        setError(null);
        
        try {
          const result = await explainData(dataKey, dataValue, dataContext);
          setExplanation(result);
        } catch (err) {
          console.error('AI Tooltip Error:', err);
          setError('Failed to load explanation');
        } finally {
          setIsLoading(false);
        }
      }
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-black/70';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-black/70';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-black/70';
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-black/70';
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-black/70';
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Wrapped Content with visual indicator */}
      <div className={`${!disabled ? 'cursor-help border-b border-dashed border-white/20 hover:border-white/40' : ''} transition-colors`}>
        {children}
        {!disabled && (
          <span className="ml-1 text-white/30 text-xs">ᴬᴵ</span>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {isVisible && !disabled && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${getPositionClasses()}`}
          >
            <div className="bg-black/70 backdrop-blur-md text-white p-3 rounded-lg shadow-2xl max-w-xs border border-white/10">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                  <span className="text-xs font-light text-white/60">AI</span>
                </div>
                <span className="text-xs text-white/40 font-mono">
                  {dataKey}
                </span>
              </div>

              {/* Content */}
              <div className="text-sm">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-white/50 text-xs">Loading...</span>
                  </div>
                ) : error ? (
                  <div className="text-red-400 text-xs">
                    {error}
                  </div>
                ) : explanation ? (
                  <div className="space-y-2">
                    <div className="text-white">
                      {explanation.ensemble ? (
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-blue-300 block mb-1">Claude:</span>
                            <p className="text-sm">{explanation.primary.response}</p>
                          </div>
                          <div>
                            <span className="text-xs text-green-300 block mb-1">GPT-4:</span>
                            <p className="text-sm">{explanation.secondary.response}</p>
                          </div>
                          <div>
                            <span className="text-xs text-purple-300 block mb-1">
                              HF ({explanation.specialist.model?.split('/')[1] || 'Specialist'}):
                            </span>
                            <p className="text-sm">{explanation.specialist.response}</p>
                          </div>
                        </div>
                      ) : explanation.combined ? (
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-blue-300 block mb-1">Claude:</span>
                            <p className="text-sm">{explanation.primary.response}</p>
                          </div>
                          <hr className="border-white/10" />
                          <div>
                            <span className="text-xs text-green-300 block mb-1">GPT-4:</span>
                            <p className="text-sm">{explanation.secondary.response}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs text-white/40 block mb-1">
                            {explanation.provider === 'anthropic' ? 'Claude' : 
                             explanation.provider === 'openai' ? 'GPT-4' :
                             explanation.provider === 'huggingface' ? `HF (${explanation.model?.split('/')[1] || 'Model'})` :
                             'AI'}
                          </span>
                          <p>{explanation.response}</p>
                          {explanation.taskType && explanation.taskType !== 'general' && (
                            <div className="text-xs text-white/30 mt-1">
                              Task: {explanation.taskType}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Value Context */}
                    <div className="bg-white/5 p-2 rounded text-xs border border-white/5">
                      <span className="text-white/40">Value: </span>
                      <span className="text-white/80 font-mono">{dataValue}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-300 text-xs">
                    Hover to get AI explanation
                  </div>
                )}
              </div>
            </div>
            
            {/* Arrow */}
            <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper component for quick data explanations
export const QuickExplain = ({ value, label, unit = "", context = {} }) => {
  return (
    <AITooltip
      dataKey={label}
      dataValue={`${value}${unit ? ` ${unit}` : ''}`}
      dataContext={context}
    >
      <span className="font-mono">
        {value}{unit && <span className="text-gray-500 ml-1">{unit}</span>}
      </span>
    </AITooltip>
  );
};

// Component for complex timestamps
export const SmartTimestamp = ({ timestamp, format = "full", context = {} }) => {
  const formatTimestamp = (ts) => {
    const date = new Date(ts);
    switch (format) {
      case 'time':
        return date.toLocaleTimeString();
      case 'date':
        return date.toLocaleDateString();
      case 'relative':
        return `${Math.round((Date.now() - date.getTime()) / 1000)}s ago`;
      default:
        return date.toLocaleString();
    }
  };

  return (
    <AITooltip
      dataKey="Timestamp"
      dataValue={timestamp}
      dataContext={{
        ...context,
        timestampFormat: format,
        explanation: "This timestamp represents when the data was recorded or measured"
      }}
      delay={500}
    >
      <time dateTime={timestamp} className="font-mono text-sm">
        {formatTimestamp(timestamp)}
      </time>
    </AITooltip>
  );
};

export default AITooltip; 