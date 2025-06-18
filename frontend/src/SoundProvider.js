import React, { createContext, useRef, useContext, useState, useEffect } from 'react';

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const clickAudio = useRef(null);
  const hoverAudio = useRef(null);
  const musicAudio = useRef(null);

  const [clickVolume, setClickVolume] = useState(1.0);
  const [hoverVolume, setHoverVolume] = useState(1.0);
  const [musicVolume, setMusicVolume] = useState(0.2);
  const [musicPlaying, setMusicPlaying] = useState(true);
  const [musicMuted, setMusicMuted] = useState(false);

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
      clickAudio.current.play();
    }
  };

  const playHover = () => {
    if (hoverAudio.current) {
      hoverAudio.current.currentTime = 0;
      hoverAudio.current.volume = hoverVolume;
      hoverAudio.current.play();
    }
  };

  return (
    <SoundContext.Provider value={{
      playClick, playHover,
      clickVolume, setClickVolume,
      hoverVolume, setHoverVolume,
      musicVolume, setMusicVolume,
      musicPlaying, setMusicPlaying,
      musicMuted, setMusicMuted
    }}>
      <audio
        ref={musicAudio}
        src="/background_menu_music.mp3"
        preload="auto"
        loop
        muted={musicMuted}
        style={{ display: 'none' }}
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
