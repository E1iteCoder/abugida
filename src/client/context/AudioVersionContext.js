import React, { createContext, useState, useEffect, useContext } from 'react';

const AudioVersionContext = createContext(null);

export const AudioVersionProvider = ({ children }) => {
  // Get saved preference from localStorage, default to 'default'
  const [selectedVersion, setSelectedVersion] = useState(() => {
    const saved = localStorage.getItem('audioVersion');
    return saved || 'default';
  });

  // Save preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('audioVersion', selectedVersion);
  }, [selectedVersion]);

  const value = {
    selectedVersion,
    setSelectedVersion,
  };

  return (
    <AudioVersionContext.Provider value={value}>
      {children}
    </AudioVersionContext.Provider>
  );
};

export const useAudioVersion = () => {
  const context = useContext(AudioVersionContext);
  if (!context) {
    throw new Error('useAudioVersion must be used within AudioVersionProvider');
  }
  return context;
};

