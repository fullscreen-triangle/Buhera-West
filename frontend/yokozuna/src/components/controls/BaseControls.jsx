import React from 'react';

/**
 * Basic control button component with consistent styling
 */
const ControlButton = ({
  label,
  onClick,
  className = '',
  disabled = false,
  icon
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`tp-control-button ${className}`}
    aria-label={label}
    title={label}
  >
    {icon && <span className="tp-control-button-icon">{icon}</span>}
    <span className="tp-control-button-label">{label}</span>
  </button>
);

/**
 * BaseControls component that provides a consistent UI container for controls
 * with standardized styling and positioning options.
 */
const BaseControls = ({
  position = 'bottom',
  opacity = 0.7,
  autoHide = false,
  className = '',
  children
}) => {
  // Determine position-based styling
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute',
      backgroundColor: `rgba(0, 0, 0, ${opacity})`,
      color: 'white',
      padding: '12px',
      borderRadius: '4px',
      display: 'flex',
      gap: '8px',
      zIndex: 10
    };
    
    // Add position-specific styles
    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          flexDirection: 'row'
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          flexDirection: 'row'
        };
      case 'left':
        return {
          ...baseStyles,
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          flexDirection: 'column'
        };
      case 'right':
        return {
          ...baseStyles,
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          flexDirection: 'column'
        };
      default:
        return baseStyles;
    }
  };
  
  return (
    <div 
      className={`tp-controls ${className} ${autoHide ? 'tp-controls-auto-hide' : ''}`} 
      style={getPositionStyles()}
    >
      {children}
    </div>
  );
};

// Export the main component and the button subcomponent
export default BaseControls;
export { ControlButton }; 