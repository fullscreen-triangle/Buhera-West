/**
 * YouTube Service for Ambient Music Playlists
 * Note: This is for background music discovery, not environmental sounds
 * Use Freesound API for weather-related ambient sounds
 */

class YouTubeService {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    this.clientId = process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  /**
   * Search for ambient music playlists (not environmental sounds)
   */
  async searchAmbientPlaylists(query = 'ambient music', maxResults = 10) {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(query)}&` +
        `type=playlist&` +
        `maxResults=${maxResults}&` +
        `key=${this.apiKey}`
      );

      const data = await response.json();
      
      if (data.error) {
        console.error('YouTube API error:', data.error.message);
        return [];
      }

      return data.items || [];
    } catch (error) {
      console.error('Failed to search YouTube:', error);
      return [];
    }
  }

  /**
   * Get weather-themed ambient music playlists
   * Note: These are music playlists, not environmental sounds
   */
  async getWeatherMusicPlaylists(weatherType) {
    const queries = {
      clear: 'sunny day ambient music',
      rain: 'rain ambient music playlist',
      storm: 'storm ambient music',
      snow: 'winter ambient music',
      wind: 'windy day music',
      fog: 'misty ambient music',
      night: 'night time ambient music'
    };

    const query = queries[weatherType] || 'ambient music';
    return await this.searchAmbientPlaylists(query, 5);
  }

  /**
   * Get videos from a playlist
   */
  async getPlaylistVideos(playlistId, maxResults = 20) {
    if (!this.apiKey) return [];

    try {
      const response = await fetch(
        `${this.baseUrl}/playlistItems?` +
        `part=snippet&` +
        `playlistId=${playlistId}&` +
        `maxResults=${maxResults}&` +
        `key=${this.apiKey}`
      );

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Failed to get playlist videos:', error);
      return [];
    }
  }

  /**
   * Search for specific ambient channels
   */
  async searchAmbientChannels() {
    const ambientChannels = [
      'ambient music',
      'nature sounds music', 
      'chillhop music',
      'ambient chill',
      'atmospheric music'
    ];

    const results = [];
    
    for (const query of ambientChannels) {
      try {
        const channelResults = await this.searchAmbientPlaylists(query, 3);
        results.push(...channelResults);
      } catch (error) {
        console.warn(`Failed to search for ${query}:`, error);
      }
    }

    return results;
  }

  /**
   * Get video details (for embedding)
   */
  async getVideoDetails(videoId) {
    if (!this.apiKey) return null;

    try {
      const response = await fetch(
        `${this.baseUrl}/videos?` +
        `part=snippet,contentDetails&` +
        `id=${videoId}&` +
        `key=${this.apiKey}`
      );

      const data = await response.json();
      return data.items?.[0] || null;
    } catch (error) {
      console.error('Failed to get video details:', error);
      return null;
    }
  }

  /**
   * Create YouTube embed URL
   */
  createEmbedUrl(videoId, options = {}) {
    const params = new URLSearchParams({
      autoplay: options.autoplay ? 1 : 0,
      mute: options.mute ? 1 : 0,
      loop: options.loop ? 1 : 0,
      controls: options.controls !== false ? 1 : 0,
      start: options.startTime || 0
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}

export default new YouTubeService(); 