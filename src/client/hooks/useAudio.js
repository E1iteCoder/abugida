import { useRef, useCallback, useState } from 'react';

/**
 * Custom hook for audio playback
 * Handles audio loading, playing, and error management
 */
export const useAudio = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = useCallback((audioUrl, options = {}) => {
    // Validate input
    if (!audioUrl) {
      console.warn("No audio URL provided");
      return;
    }

    // Stop any currently playing audio if needed
    if (options.stopCurrent && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    // Create and play new audio
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Handle volume if specified
    if (options.volume !== undefined) {
      audio.volume = Math.max(0, Math.min(1, options.volume));
    }

    // Set playing state
    setIsPlaying(true);

    // Play with error handling
    audio.play().catch((error) => {
      console.error("Audio playback failed:", error);
      setIsPlaying(false);
      if (options.onError) {
        options.onError(error);
      }
    });

    // Handle completion
    audio.onended = () => {
      setIsPlaying(false);
      if (options.onEnded) {
        options.onEnded();
      }
    };

    return audio;
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { playAudio, stopAudio, isPlaying };
};

