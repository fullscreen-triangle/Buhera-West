import React from 'react';

interface ControlButtonProps {
  /** Label text for the button */
  label: string;
  /** onClick handler function */
  onClick: () => void;
  /** Optional CSS class name */
  className?: string;
  /** Optional disabled state */
  disabled?: boolean;
  /** Optional icon component */
  icon?: React.ReactNode;
}

/**
 * Basic control button component with consistent styling
 */
const ControlButton: React.FC<ControlButtonProps> = ({
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

interface BaseControlsProps {
  /** Position of the controls panel */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Transparency level for the controls background (0-1) */
  opacity?: number;
  /** Whether to auto-hide controls when not in use */
  autoHide?: boolean;
  /** CSS class name for the container */
  className?: string;
  /** Control panel children */
  children: React.ReactNode;
}

/**
 * BaseControls component that provides a consistent UI container for controls
 * with standardized styling and positioning options.
 */
const BaseControls: React.FC<BaseControlsProps> = ({
  position = 'bottom',
  opacity = 0.7,
  autoHide = false,
  className = '',
  children
}) => {
  // Determine position-based styling
  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
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