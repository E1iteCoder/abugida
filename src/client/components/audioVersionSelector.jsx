import React from 'react';
import { useAudioVersion } from '../context/AudioVersionContext';
import { AUDIO_VERSIONS } from '../data/audioVersions';
import '../styles/audioVersionSelector.css';

export default function AudioVersionSelector() {
  const { selectedVersion, setSelectedVersion } = useAudioVersion();

  const handleVersionChange = (e) => {
    setSelectedVersion(e.target.value);
  };

  return (
    <div className="audio-version-selector">
      <select
        className="theme-select"
        value={selectedVersion}
        onChange={handleVersionChange}
        aria-label="Select audio version"
      >
        {Object.entries(AUDIO_VERSIONS).map(([key, version]) => (
          <option key={key} value={key}>
            {version.name} - {version.description}
          </option>
        ))}
      </select>
      <div className="audio-version-info">
        <small>
          Currently using: <strong>{AUDIO_VERSIONS[selectedVersion]?.name}</strong>
        </small>
      </div>
    </div>
  );
}

