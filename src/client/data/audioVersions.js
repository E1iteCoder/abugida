// Audio versions configuration
// Each audio file can have multiple versions (different voices, accents, etc.)
// The "default" version uses the current audio links

import audioMap from './audio.js';

// Define available audio versions (6 total versions)
export const AUDIO_VERSIONS = {
  default: {
    name: 'Default',
    description: 'Standard pronunciation (current)',
  },
  version2: {
    name: 'Alternative Voice',
    description: 'Alternative pronunciation',
  },
  version3: {
    name: 'Regional Accent',
    description: 'Regional variation',
  },
  version4: {
    name: 'Version 4',
    description: 'Fourth audio option',
  },
  version5: {
    name: 'Version 5',
    description: 'Fifth audio option',
  },
  version6: {
    name: 'Version 6',
    description: 'Sixth audio option',
  },
};

// Create audio version map
// For now, all versions use the same URLs (current audio)
// You can add different URLs for each version later
const createAudioVersions = () => {
  const versions = {};
  
  // For each audio file, create version entries (6 versions total)
  Object.keys(audioMap).forEach((filename) => {
    versions[filename] = {
      default: audioMap[filename], // Current audio as default
      version2: audioMap[filename], // Placeholder - replace with actual URL
      version3: audioMap[filename], // Placeholder - replace with actual URL
      version4: audioMap[filename], // Placeholder - replace with actual URL
      version5: audioMap[filename], // Placeholder - replace with actual URL
      version6: audioMap[filename], // Placeholder - replace with actual URL
    };
  });
  
  return versions;
};

export const audioVersions = createAudioVersions();

// Helper function to get audio URL for a specific version
export const getAudioUrl = (filename, version = 'default') => {
  if (!filename) return null;
  
  const fileVersions = audioVersions[filename];
  if (!fileVersions) {
    // Fallback to old audioMap if file not in versions
    return audioMap[filename] || null;
  }
  
  return fileVersions[version] || fileVersions.default || null;
};

// Export the default audioMap for backward compatibility
export { audioMap };
export default audioVersions;

