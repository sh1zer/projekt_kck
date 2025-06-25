import React, { createContext, useRef, useContext, useState, useEffect } from 'react';

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const clickAudio = useRef(null);
  const hoverAudio = useRef(null);
  const musicAudio = useRef(null);

  const [clickVolume, setClickVolume] = useState(1.0);
  const [hoverVolume, setHoverVolume] = useState(1.0);
  const [musicVolume, setMusicVolume] = useState(1.0);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [musicMuted, setMusicMuted] = useState(false);
  const [musicReady, setMusicReady] = useState(false);

  // Explicit play function for user gesture
  const playMusicNow = () => {
    const audio = musicAudio.current;
    if (audio && musicReady) {
      if (audio.paused) {
        audio.muted = false;
        audio.volume = musicVolume;
        audio.play().then(() => {
          setMusicPlaying(true);
          console.log('Background music started.');
        }).catch((err) => {
          console.warn('Music play failed:', err);
        });
      }
    } else {
      if (!musicReady) console.log('Music not ready yet.');
    }
  };

  // Add global event listeners for user gesture
  useEffect(() => {
    const tryPlay = () => {
      playMusicNow();
    };
    document.addEventListener('mousedown', tryPlay);
    document.addEventListener('keydown', tryPlay);
    document.addEventListener('touchstart', tryPlay);
    return () => {
      document.removeEventListener('mousedown', tryPlay);
      document.removeEventListener('keydown', tryPlay);
      document.removeEventListener('touchstart', tryPlay);
    };
  }, [musicReady, musicVolume]);

  // Only play/pause when play state changes, not on volume change
  useEffect(() => {
    const audio = musicAudio.current;
    if (!audio) return;
    audio.volume = musicVolume;
    audio.muted = musicMuted;
    if (musicPlaying && !musicMuted) {
      if (audio.paused) audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [musicPlaying, musicVolume, musicMuted]);

  const playClick = () => {
    if (clickAudio.current) {
      clickAudio.current.currentTime = 0;
      clickAudio.current.volume = clickVolume;
      const playPromise = clickAudio.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Ignore interrupted playback errors
          if (error.name !== 'AbortError') {
            console.warn('Click audio play failed:', error);
          }
        });
      }
    }
  };

  const playHover = () => {
    if (hoverAudio.current) {
      hoverAudio.current.currentTime = 0;
      hoverAudio.current.volume = hoverVolume;
      const playPromise = hoverAudio.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Ignore interrupted playback errors
          if (error.name !== 'AbortError') {
            console.warn('Hover audio play failed:', error);
          }
        });
      }
    }
  };

  return (
    <SoundContext.Provider value={{
      playClick, playHover,
      clickVolume, setClickVolume,
      hoverVolume, setHoverVolume,
      musicVolume, setMusicVolume,
      musicPlaying, setMusicPlaying,
      musicMuted, setMusicMuted,
      playMusicNow
    }}>
      <audio
        ref={musicAudio}
        src="/background_menu_music.mp3"
        preload="auto"
        loop
        muted={musicMuted}
        style={{ display: 'none' }}
        onCanPlayThrough={() => { setMusicReady(true); console.log('Music ready'); }}
      />
      <audio ref={clickAudio} src="/just_button_sound.mp3" preload="auto" />
      <audio ref={hoverAudio} src="/select_button_sound.mp3" preload="auto" />
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}