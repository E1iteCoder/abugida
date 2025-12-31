import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

/**
 * Hook for tracking user progress across different sections
 */
export const useProgressTracking = () => {
  const { isAuthenticated } = useAuth();

  const trackProgress = useCallback(async (topicKey, section, page, completed = true) => {
    if (!isAuthenticated) return;

    try {
      await authAPI.updateProgress(topicKey, section, page, completed, null);
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  }, [isAuthenticated]);

  return { trackProgress };
};


