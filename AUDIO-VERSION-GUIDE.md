# Audio Version Selection System

This guide explains how the audio version selection system works and how to add new audio versions.

## Overview

The system allows users to choose between different audio samples (versions) for pronunciation. The default version uses your current audio links, and you can add additional versions with different voices, accents, or pronunciations.

## How It Works

### 1. **Audio Version Structure**

Audio versions are defined in `src/client/data/audioVersions.js`:
- Each audio file can have multiple versions (default, version2, version3, etc.)
- The `default` version uses your current audio links from `audio.js`
- Other versions are placeholders that you can replace with actual URLs

### 2. **User Preference Storage**

- User's selected version is stored in `localStorage` as `audioVersion`
- Default value is `'default'` (uses current audio)
- Preference persists across sessions

### 3. **Component Integration**

- All components use `useAudio()` hook which automatically resolves filenames to URLs based on selected version
- Components pass **filenames** (e.g., `"ha.mp3"`), not URLs
- The `useAudio` hook resolves the filename to the correct URL based on user's version preference

## Current Implementation

### Files Created/Modified:

1. **`src/client/data/audioVersions.js`**
   - Defines available audio versions
   - Maps filenames to version-specific URLs
   - Current audio is used as `default` version

2. **`src/client/context/AudioVersionContext.js`**
   - Manages audio version preference state
   - Persists to localStorage

3. **`src/client/components/audioVersionSelector.jsx`**
   - UI component for selecting audio version
   - Added to Settings page

4. **`src/client/utils/getAudio.js`**
   - Utility to get audio URL based on selected version

5. **Updated Components:**
   - `useAudio` hook - now resolves filenames to URLs based on version
   - `letterDetail.jsx` - uses new system
   - `lettergroup.jsx` - uses new system
   - `letterTracer.jsx` - uses new system
   - `learn.jsx` - uses new system
   - `quiz.jsx` - uses new system
   - `flashContainer.jsx` - uses new system

## How to Add New Audio Versions

### Step 1: Update Version Names/Descriptions (Optional)

Edit `src/client/data/audioVersions.js` to customize version names:

```javascript
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
    name: 'Slow Pronunciation',
    description: 'Slower pace for learning',
  },
  version5: {
    name: 'Fast Pronunciation',
    description: 'Faster pace',
  },
  version6: {
    name: 'Formal Speech',
    description: 'Formal pronunciation style',
  },
};
```

**Note:** The system currently supports 6 versions (default + version2-6). All are already configured.

### Step 2: Add Audio URLs

In the same file, update the `createAudioVersions` function to add your actual URLs:

```javascript
const createAudioVersions = () => {
  const versions = {};
  
  Object.keys(audioMap).forEach((filename) => {
    versions[filename] = {
      default: audioMap[filename], // Current audio
      version2: "https://your-cloudinary-url.com/version2/" + filename,
      version3: "https://your-cloudinary-url.com/version3/" + filename,
      version4: "https://your-cloudinary-url.com/version4/" + filename,
      version5: "https://your-cloudinary-url.com/version5/" + filename,
      version6: "https://your-cloudinary-url.com/version6/" + filename,
    };
  });
  
  return versions;
};
```

**Note:** Currently all 6 versions use the same URLs (placeholders). Replace with your actual audio URLs when ready.

### Step 3: Upload Your Audio Files

1. Upload new audio files to Cloudinary (or your CDN)
2. Update the URLs in `audioVersions.js`
3. Test the new version in the Settings page

## Usage in Components

### Basic Usage

```javascript
import { useAudio } from '../hooks/useAudio';

function MyComponent() {
  const { playAudio } = useAudio();
  
  // Pass filename, not URL
  return (
    <button onClick={() => playAudio("ha.mp3")}>
      Play Audio
    </button>
  );
}
```

### Getting Audio URL Directly

```javascript
import { useGetAudio } from '../utils/getAudio';

function MyComponent() {
  const getAudio = useGetAudio();
  const audioUrl = getAudio("ha.mp3"); // Returns URL based on selected version
  
  return <audio src={audioUrl} />;
}
```

## Default Behavior

- **Default version** uses your current audio links (from `audio.js`)
- If a version doesn't have a URL for a specific file, it falls back to the default version
- If a file doesn't exist in any version, it returns `null`

## Settings Page

Users can change their audio version preference in:
- **Settings** → **Audio Preferences** → Select version from dropdown

The preference is saved automatically and applies to all audio playback throughout the app.

## Testing

1. Go to Settings page
2. Select different audio versions from the dropdown
3. Navigate to Learn, Quiz, or Reference sections
4. Play audio - it should use the selected version
5. Check that preference persists after page refresh

## Notes

- All current audio files use the same URLs for all versions (placeholders)
- To add actual different audio, upload new files and update URLs in `audioVersions.js`
- The system is backward compatible - existing code continues to work
- Components now pass filenames instead of URLs, making version switching seamless

