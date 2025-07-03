import React from 'react';
import Head from 'next/head';
import AmbientAudioDemo from '../components/weather/AmbientAudioDemo';

export default function AudioDemoPage() {
  return (
    <>
      <Head>
        <title>Ambient Weather Audio Demo - Buhera West</title>
        <meta name="description" content="Interactive demo of contextual ambient audio system" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🎵 Ambient Weather Audio System
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience contextual environmental sounds that automatically sync with weather conditions. 
              This system uses AI-powered sound selection to create immersive ambient audio that enhances 
              your weather visualization experience.
            </p>
          </div>

          {/* Demo Component */}
          <AmbientAudioDemo />

          {/* Features Section */}
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl mb-3">🌦️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Weather-Synchronized</h3>
              <p className="text-gray-400 text-sm">
                Automatically detects weather changes and plays appropriate ambient sounds. 
                Rain triggers gentle rainfall sounds, storms bring thunder, clear skies add bird songs.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl mb-3">🎚️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Subtle & Layered</h3>
              <p className="text-gray-400 text-sm">
                Designed to be non-intrusive with multiple audio layers. 
                Primary weather sounds, secondary environmental effects, and regional ambience blend naturally.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl mb-3">🌍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Location-Aware</h3>
              <p className="text-gray-400 text-sm">
                Adapts sounds based on geographic location. 
                African locations get savanna birds, coastal areas include ocean waves, mountains add echo effects.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="text-lg font-semibold text-white mb-2">Smooth Transitions</h3>
              <p className="text-gray-400 text-sm">
                Weather changes trigger smooth audio transitions with fade effects. 
                No jarring cuts - just natural environmental audio evolution.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl mb-3">🎵</div>
              <h3 className="text-lg font-semibold text-white mb-2">Real Sound Library</h3>
              <p className="text-gray-400 text-sm">
                Powered by Freesound API with thousands of high-quality environmental recordings. 
                Each playback uses different sounds to avoid repetition.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance Optimized</h3>
              <p className="text-gray-400 text-sm">
                Caching system reduces API calls, Web Audio API ensures low latency, 
                and intelligent volume management prevents audio conflicts.
              </p>
            </div>
          </div>

          {/* Implementation Details */}
          <div className="mt-12 bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">🛠️ Technical Implementation</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">APIs Used</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• <strong>Freesound API:</strong> Environmental sound library</li>
                  <li>• <strong>OpenWeather API:</strong> Real-time weather data</li>
                  <li>• <strong>Web Audio API:</strong> Advanced audio processing</li>
                  <li>• <strong>Geolocation API:</strong> Location detection</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Key Features</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Multi-layered audio mixing</li>
                  <li>• Contextual sound selection</li>
                  <li>• Adaptive volume control</li>
                  <li>• Intelligent caching system</li>
                  <li>• Fallback local sounds</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="mt-8 bg-blue-900/20 border border-blue-500/50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">🚀 Quick Setup</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p>1. Get a free Freesound API key: <a href="https://freesound.org/apiv2/apply/" className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">freesound.org/apiv2/apply</a></p>
              <p>2. Add to your <code className="bg-gray-700 px-2 py-1 rounded">.env.local</code>: <code className="bg-gray-700 px-2 py-1 rounded">NEXT_PUBLIC_FREESOUND_API_KEY=your_key</code></p>
              <p>3. Import: <code className="bg-gray-700 px-2 py-1 rounded">import AmbientWeatherAudio from '@/components/weather/AmbientWeatherAudio'</code></p>
              <p>4. Use: <code className="bg-gray-700 px-2 py-1 rounded">&lt;AmbientWeatherAudio weatherData={data} location={coords} /&gt;</code></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 