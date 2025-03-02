import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of our settings
type Settings = {
  notificationsEnabled: boolean;
  breakingNewsEnabled: boolean;
  scholarUpdatesEnabled: boolean;
  filterKeywords: string[];
};

// Default settings
const defaultSettings: Settings = {
  notificationsEnabled: false,
  breakingNewsEnabled: true,
  scholarUpdatesEnabled: true,
  filterKeywords: ['racism', 'MAGA', 'politics', 'economy'],
};

// Create the context
type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('userSettings');
        if (storedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(storedSettings) });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Update settings
  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('userSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Reset settings to default
  const resetSettings = async () => {
    try {
      setSettings(defaultSettings);
      await AsyncStorage.setItem('userSettings', JSON.stringify(defaultSettings));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  // Only render children once settings are loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for using the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};