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

  const getTruncatedText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  return (
    <div className="audio-version-selector">
      <select
        className="theme-select"
        value={selectedVersion}
        onChange={handleVersionChange}
        aria-label="Select audio version"
        title={AUDIO_VERSIONS[selectedVersion] ? getOptionText(AUDIO_VERSIONS[selectedVersion]) : ''}
      >
        {Object.entries(AUDIO_VERSIONS).map(([key, version]) => {
          const fullText = getOptionText(version);
          return (
            <option key={key} value={key} title={fullText}>
              {getTruncatedText(fullText, 60)}
            </option>
          );
        })}
      </select>
      <div className="audio-version-info" title={AUDIO_VERSIONS[selectedVersion]?.name || ''}>
        <small>
          Currently using: <strong>{AUDIO_VERSIONS[selectedVersion]?.name || 'Unknown'}</strong>
        </small>
      </div>
    </div>
  );
}

