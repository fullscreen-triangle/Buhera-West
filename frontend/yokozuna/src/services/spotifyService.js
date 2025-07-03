/**
 * Spotify Service for Background Music Integration
 * Note: This is for background music, not environmental sounds
 * Use Freesound API for weather-related ambient sounds
 */

class SpotifyService {
  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
    this.accessToken = null;
    this.isInitialized = false;
  }

  /**
   * Get Spotify access token using Client Credentials flow
   * (For searching tracks, no user login required)
   */
  async getAccessToken() {
    if (!this.clientId || !this.clientSecret) {
      console.warn('Spotify credentials not configured');
      return null;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get Spotify access token:', error);
      return null;
    }
  }

  /**
   * Search for background music playlists
   * (Limited usefulness for environmental sounds)
   */
  async searchBackgroundMusic(query = 'ambient chill') {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    if (!this.accessToken) return [];

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const data = await response.json();
      return data.playlists?.items || [];
    } catch (error) {
      console.error('Failed to search Spotify:', error);
      return [];
    }
  }

  /**
   * Get weather-themed playlists (very limited)
   */
  async getWeatherPlaylists(weatherType) {
    const queries = {
      rain: 'rainy day chill',
      storm: 'thunderstorm ambient',
      clear: 'sunny day music',
      snow: 'winter ambient',
      wind: 'windy day music',
      fog: 'misty ambient',
      night: 'night time ambient'
    };

    const query = queries[weatherType] || 'ambient chill';
    return await this.searchBackgroundMusic(query);
  }
}

export default new SpotifyService(); 