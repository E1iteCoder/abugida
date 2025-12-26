// Audio versions configuration
// Each audio file can have multiple versions (different voices, accents, etc.)
// The "default" version uses the current audio links

import audioMap from './audio.js';
import audioMapVersion2 from './audio1.js';
import audioMapVersion3 from './audio2.js';
import audioMapVersion4 from './audio3.js';
import audioMapVersion5 from './audio4.js';
import audioMapVersion6 from './audio5.js';

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

// Create audio version map by combining all version maps
// Each version has its own file for easy management
const createAudioVersions = () => {
  const versions = {};
  
  // Get all unique filenames from all version maps
  const allFilenames = new Set([
    ...Object.keys(audioMap),
    ...Object.keys(audioMapVersion2),
    ...Object.keys(audioMapVersion3),
    ...Object.keys(audioMapVersion4),
    ...Object.keys(audioMapVersion5),
    ...Object.keys(audioMapVersion6),
  ]);
  
  // For each audio file, create version entries from separate files
  allFilenames.forEach((filename) => {
    versions[filename] = {
      default: audioMap[filename] || null,
      version2: audioMapVersion2[filename] || audioMap[filename] || null, // Fallback to default if missing
      version3: audioMapVersion3[filename] || audioMap[filename] || null,
      version4: audioMapVersion4[filename] || audioMap[filename] || null,
      version5: audioMapVersion5[filename] || audioMap[filename] || null,
      version6: audioMapVersion6[filename] || audioMap[filename] || null,
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

