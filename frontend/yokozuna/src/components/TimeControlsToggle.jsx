import React from 'react';
import { useTime } from '../contexts/TimeContext';
import { FaClock, FaEyeSlash } from 'react-icons/fa';

/**
 * Floating toggle button for showing/hiding global time controls
 */
const TimeControlsToggle = () => {
  const { showTimeControls, setShowTimeControls } = useTime();
  
  return (
    <button
      onClick={() => setShowTimeControls(!showTimeControls)}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: showTimeControls 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'rgba(0, 120, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        zIndex: 9998,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'scale(1)',
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1)';
        e.target.style.background = showTimeControls 
          ? 'rgba(255, 255, 255, 0.3)' 
          : 'rgba(0, 120, 255, 1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1)';
        e.target.style.background = showTimeControls 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'rgba(0, 120, 255, 0.9)';
      }}
      title={showTimeControls ? 'Hide Timeline' : 'Show Timeline'}
    >
      {showTimeControls ? <FaEyeSlash /> : <FaClock />}
    </button>
  );
};

export default TimeControlsToggle; 