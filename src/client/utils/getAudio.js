// Utility function to get audio URL based on selected version
import { useCallback } from 'react';
import { getAudioUrl } from '../data/audioVersions';
import { useAudioVersion } from '../context/AudioVersionContext';

/**
 * Hook to get audio URL for a filename using the currently selected version
 * @returns {Function} - Function that takes filename and returns URL
 */
export const useGetAudio = () => {
  const { selectedVersion } = useAudioVersion();
  
  return useCallback((filename) => {
    return getAudioUrl(filename, selectedVersion);
  }, [selectedVersion]);
};

/**
 * Get audio URL directly (for use outside React components)
 * @param {string} filename - The audio filename
 * @param {string} version - The version to use (optional, defaults to 'default')
 * @returns {string|null} - The audio URL or null if not found
 */
export { getAudioUrl };

