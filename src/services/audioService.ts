import { Platform } from 'react-native';

export interface AudioPlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  hasAudioResource: boolean;
}

class AudioService {
  private currentUtterance: any = null;

  /**
   * Speaks or plays the phrase.
   * If an audioUrl exists, plays the audio file.
   * If no audioUrl exists, can use Web Speech API with Swedish voice if available,
   * while clearly marking it as synthetic preview.
   */
  async playPhrase(
    text: string,
    audioUrl?: string,
    onStatusChange?: (status: AudioPlaybackState) => void
  ): Promise<void> {
    if (!text && !audioUrl) return;

    if (audioUrl) {
      if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
        try {
          onStatusChange?.({
            isPlaying: false,
            isLoading: true,
            hasError: false,
            hasAudioResource: true,
          });

          const audio = new Audio(audioUrl);
          audio.onplaying = () => {
            onStatusChange?.({
              isPlaying: true,
              isLoading: false,
              hasError: false,
              hasAudioResource: true,
            });
          };
          audio.onended = () => {
            onStatusChange?.({
              isPlaying: false,
              isLoading: false,
              hasError: false,
              hasAudioResource: true,
            });
          };
          audio.onerror = () => {
            onStatusChange?.({
              isPlaying: false,
              isLoading: false,
              hasError: true,
              errorMessage: 'Kunde inte ladda ljudfilen.',
              hasAudioResource: false,
            });
          };
          await audio.play();
          return;
        } catch (err) {
          console.warn('Audio playback error', err);
        }
      }
    }

    // Web Speech API fallback for browser environment
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'sv-SE';
        utterance.rate = 0.88; // Slightly slower, pedagogical speed for A1 learners

        onStatusChange?.({
          isPlaying: true,
          isLoading: false,
          hasError: false,
          hasAudioResource: Boolean(audioUrl),
        });

        utterance.onend = () => {
          onStatusChange?.({
            isPlaying: false,
            isLoading: false,
            hasError: false,
            hasAudioResource: Boolean(audioUrl),
          });
        };

        utterance.onerror = () => {
          onStatusChange?.({
            isPlaying: false,
            isLoading: false,
            hasError: true,
            errorMessage: 'Talsyntes inte tillgänglig.',
            hasAudioResource: false,
          });
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        onStatusChange?.({
          isPlaying: false,
          isLoading: false,
          hasError: true,
          errorMessage: 'Ljud kunde inte spelas upp.',
          hasAudioResource: false,
        });
      }
    } else {
      // Native / no audio resource available
      onStatusChange?.({
        isPlaying: false,
        isLoading: false,
        hasError: false,
        hasAudioResource: Boolean(audioUrl),
      });
    }
  }

  stopAll(): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioService = new AudioService();
