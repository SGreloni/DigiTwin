"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AppScreen, AppSettings, StoredSimulation, SimulationResult } from "@/lib/types";
import { getSettings, saveSettings, isOnboardingComplete, setOnboardingComplete } from "@/lib/storage";

interface AppContextType {
  // Navigation
  currentScreen: AppScreen;
  navigateTo: (screen: AppScreen) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Current simulation
  currentResult: SimulationResult | null;
  setCurrentResult: (result: SimulationResult | null) => void;

  // History detail view
  selectedHistoryItem: StoredSimulation | null;
  setSelectedHistoryItem: (item: StoredSimulation | null) => void;

  // Onboarding
  onboardingComplete: boolean;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("dashboard");
  const [settings, setSettings] = useState<AppSettings>({ darkMode: false, language: "en" });
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<StoredSimulation | null>(null);
  const [onboardingComplete, setOnboardingState] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load settings from storage on mount
  useEffect(() => {
    const storedSettings = getSettings();
    setSettings(storedSettings);
    setOnboardingState(isOnboardingComplete());
    setMounted(true);
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (!mounted) return;

    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode, mounted]);

  const navigateTo = useCallback((screen: AppScreen) => {
    setCurrentScreen(screen);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingComplete();
    setOnboardingState(true);
    setCurrentScreen("dashboard");
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigateTo,
        settings,
        updateSettings,
        currentResult,
        setCurrentResult,
        selectedHistoryItem,
        setSelectedHistoryItem,
        onboardingComplete,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
