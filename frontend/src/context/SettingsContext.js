import React, { createContext, useState, useEffect } from 'react';

// Domyślne wartości
const defaultSettings = {
  theme: 'dark', // 'dark' lub 'light'
};

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Pobierz z localStorage lub użyj domyślnych
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    // Zapisuj ustawienia przy każdej zmianie
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
