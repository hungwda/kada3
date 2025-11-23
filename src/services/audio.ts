/**
 * Audio service for offline-safe audio playback
 */

class AudioService {
  private audioContext: AudioContext | null = null;
  private audioCache: Map<string, AudioBuffer> = new Map();

  /**
   * Initialize audio context (lazy)
   */
  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Load and cache audio file
   */
  async loadAudio(url: string): Promise<AudioBuffer> {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url)!;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.getAudioContext().decodeAudioData(arrayBuffer);
      this.audioCache.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Failed to load audio:', url, error);
      throw error;
    }
  }

  /**
   * Play audio from URL or cache
   */
  async play(url: string): Promise<void> {
    try {
      const audioBuffer = await this.loadAudio(url);
      const source = this.getAudioContext().createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.getAudioContext().destination);
      source.start(0);
    } catch (error) {
      console.error('Failed to play audio:', url, error);
    }
  }

  /**
   * Preload multiple audio files
   */
  async preload(urls: string[]): Promise<void> {
    await Promise.all(urls.map(url => this.loadAudio(url).catch(err => console.warn('Preload failed:', url, err))));
  }
}

export const audioService = new AudioService();
