import React from 'react';
import { useAudioVersion } from '../context/AudioVersionContext';
import { AUDIO_VERSIONS } from '../data/audioVersions';
import '../styles/audioVersionSelector.css';

export default function AudioVersionSelector() {
  const { selectedVersion, setSelectedVersion } = useAudioVersion();

  const handleVersionChange = (e) => {
    setSelectedVersion(e.target.value);
  };

  const getOptionText = (version) => {
    return `${version.name} - ${version.description}`;
  };

  const currentVersion = AUDIO_VERSIONS[selectedVersion];
  const selectedText = currentVersion ? getOptionText(currentVersion) : '';

  return (
    <div className="audio-version-selector">
      <select
        className="theme-select"
        value={selectedVersion}
        onChange={handleVersionChange}
        aria-label="Select audio version"
        title={selectedText}
      >
        {Object.entries(AUDIO_VERSIONS).map(([key, version]) => (
          <option key={key} value={key}>
            {getOptionText(version)}
          </option>
        ))}
      </select>
      <div className="audio-version-info" title={currentVersion?.name || ''}>
        <small>
          Currently using: <strong>{currentVersion?.name || 'Unknown'}</strong>
        </small>
      </div>
    </div>
  );
}

