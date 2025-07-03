import React, { useEffect } from 'react';
import Head from 'next/head';
import { useTime } from '../contexts/TimeContext';
import useSceneTime from '../hooks/useSceneTime';
import TimeAwareScene from '../components/examples/TimeAwareScene';
import TransitionEffect from '../components/TransitionEffect';

/**
 * Test page to demonstrate global timeline functionality
 */
const TestTimelinePage = () => {
  const { 
    setShowTimeControls, 
    currentTime, 
    isPlaying, 
    duration, 
    play, 
    pause, 
    setScene,
    markers 
  } = useTime();
  
  const { getDayNightCycle, getSeasonalCycle } = useSceneTime();
  
  // Show time controls when this page loads
  useEffect(() => {
    setShowTimeControls(true);
    setScene('weather'); // Set to weather scene for demo
    
    // Cleanup - hide controls when leaving page
    return () => {
      setShowTimeControls(false);
    };
  }, [setShowTimeControls, setScene]);
  
  const dayNight = getDayNightCycle();
  const seasonal = getSeasonalCycle();
  
  // Calculate background color based on time
  const backgroundStyle = {
    background: `linear-gradient(to bottom, 
      hsl(${200 + dayNight * 30}, ${50 + dayNight * 30}%, ${20 + dayNight * 60}%),
      hsl(${220 + dayNight * 20}, ${40 + dayNight * 40}%, ${10 + dayNight * 50}%)
    )`,
    minHeight: '100vh',
    transition: 'background 0.5s ease'
  };
  
  return (
    <>
      <Head>
        <title>Timeline Test - Environmental Intelligence</title>
        <meta name="description" content="Test page for global timeline functionality" />
      </Head>
      
      <TransitionEffect />
      
      <div style={backgroundStyle}>
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Global Timeline Test
            </h1>
            <p className="text-gray-200 text-lg max-w-2xl mx-auto">
              This page demonstrates the global timeline functionality. 
              Use the timeline controls at the bottom to scrub through time and see how the scene responds.
            </p>
          </div>
          
          {/* Time Information Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Current Time State</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-gray-300 mb-1">Current Time</div>
                <div className="text-xl font-mono text-white">
                  {Math.floor(currentTime / 3600).toString().padStart(2, '0')}:
                  {Math.floor((currentTime % 3600) / 60).toString().padStart(2, '0')}:
                  {Math.floor(currentTime % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-gray-300 mb-1">Day/Night</div>
                <div className="text-xl font-mono text-white">
                  {(dayNight * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">
                  {dayNight > 0.8 ? 'Bright Day' : dayNight > 0.4 ? 'Dawn/Dusk' : 'Night'}
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-gray-300 mb-1">Season</div>
                <div className="text-xl font-mono text-white">
                  {(seasonal * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">
                  {seasonal < 0.25 ? 'Spring' : seasonal < 0.5 ? 'Summer' : seasonal < 0.75 ? 'Autumn' : 'Winter'}
                </div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-gray-300 mb-1">Playback</div>
                <div className="text-xl font-mono text-white">
                  {isPlaying ? 'Playing' : 'Paused'}
                </div>
                <button
                  onClick={isPlaying ? pause : play}
                  className="text-xs bg-blue-500/50 hover:bg-blue-500/70 px-2 py-1 rounded mt-1 transition-colors"
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
            </div>
          </div>
          
          {/* 3D Scene Demo */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Time-Aware 3D Scene</h2>
            <p className="text-gray-200 mb-4">
              Watch how the 3D scene below responds to time changes. The sun moves across the sky, 
              ground colors shift with seasons, and lighting changes throughout the day.
            </p>
            <TimeAwareScene />
          </div>
          
          {/* Timeline Markers Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Timeline Markers</h2>
            {markers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {markers.map((marker, index) => (
                  <div key={index} className="bg-black/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: marker.color }}
                      />
                      <div className="text-white font-medium">{marker.label}</div>
                    </div>
                    <div className="text-sm text-gray-300">
                      {Math.floor(marker.time / 3600).toString().padStart(2, '0')}:
                      {Math.floor((marker.time % 3600) / 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {((marker.time / duration) * 100).toFixed(1)}% through timeline
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-300">No markers defined for current scene</p>
            )}
          </div>
          
          {/* Instructions */}
          <div className="mt-8 text-center">
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 inline-block">
              <p className="text-blue-100 text-sm">
                <strong>Controls:</strong> Use the timeline at the bottom to scrub through time. 
                Press Space to play/pause, arrow keys to skip, or click the timeline to jump to specific times.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestTimelinePage; 