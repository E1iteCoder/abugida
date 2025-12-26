/**
 * Plays a sequence of audio clips with delays between them
 * @param {string[]} audioUrls - Array of audio URLs to play
 * @param {Object} options - Configuration options
 * @returns {Function} - Function to stop the sequence
 */
export const playAudioSequence = (audioUrls, options = {}) => {
  const {
    gapMs = 600,
    onComplete,
    onError,
    volume = 1,
  } = options;

  const clips = audioUrls.filter(url => url); // Remove nulls/undefined
  if (clips.length === 0) {
    if (onComplete) onComplete();
    return () => {}; // Return no-op stop function
  }

  let idx = 0;
  let currentAudio = null;
  let isStopped = false;

  const playNext = () => {
    if (isStopped || idx >= clips.length) {
      currentAudio = null;
      if (onComplete && !isStopped) onComplete();
      return;
    }

    currentAudio = new Audio(clips[idx]);
    currentAudio.volume = volume;
    
    currentAudio.play().catch((error) => {
      console.error(`Audio playback failed for clip ${idx}:`, error);
      if (onError) onError(error, idx);
      // Continue to next clip even if current fails
      idx++;
      setTimeout(playNext, gapMs);
    });
    
    currentAudio.onended = () => {
      idx++;
      setTimeout(playNext, gapMs);
    };
  };

  playNext();

  // Return stop function
  return () => {
    isStopped = true;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
  };
};

