// Local storage utilities for simulation history
// Designed to be replaceable with AsyncStorage for React Native

import type { StoredSimulation, AppSettings, SimulationConfig, SimulationSummary, DailyResult } from "./types";

const STORAGE_KEYS = {
  SIMULATIONS: "digitwin_simulations",
  SETTINGS: "digitwin_settings",
  ONBOARDING_COMPLETE: "digitwin_onboarding_complete",
} as const;

// Generate unique ID
function generateId(): string {
  return `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Simulations storage
export function getStoredSimulations(): StoredSimulation[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SIMULATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSimulation(
  config: SimulationConfig,
  summary: SimulationSummary,
  dailyResults: DailyResult[]
): StoredSimulation {
  const simulation: StoredSimulation = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    config,
    summary,
    daily_results: dailyResults,
  };

  const simulations = getStoredSimulations();
  simulations.unshift(simulation);
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify(simulations));
  }
  
  return simulation;
}

export function getSimulationById(id: string): StoredSimulation | null {
  const simulations = getStoredSimulations();
  return simulations.find((s) => s.id === id) || null;
}

export function deleteSimulation(id: string): void {
  const simulations = getStoredSimulations();
  const filtered = simulations.filter((s) => s.id !== id);
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify(filtered));
  }
}

export function clearAllSimulations(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.SIMULATIONS);
  }
}

// Settings storage
export function getSettings(): AppSettings {
  const defaults: AppSettings = {
    darkMode: true,
    language: "es",
  };

  if (typeof window === "undefined") return defaults;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...defaults, ...JSON.parse(data) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  }
  
  return updated;
}

// Onboarding
export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === "true";
}

export function setOnboardingComplete(): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");
  }
}

// CSV Export utility
export function exportToCSV(dailyResults: DailyResult[], config: SimulationConfig): string {
  const headers = [
    "day",
    "DVS",
    "LAI",
    "TAGP",
    "TWSO",
    "TWLV",
    "TWST",
    "TWRT",
    "TRA",
    "RD",
    "SM",
    "WWLOW",
    "RFTRA",
  ];

  const rows = dailyResults.map((r) => [
    r.day,
    r.DVS,
    r.LAI,
    r.TAGP,
    r.TWSO,
    r.TWLV,
    r.TWST,
    r.TWRT,
    r.TRA,
    r.RD,
    r.SM,
    r.WWLOW,
    r.RFTRA,
  ].join(","));

  const metadata = [
    `# DigiTwin Simulation Export`,
    `# Crop: ${config.crop_name}`,
    `# Variety: ${config.variety_name}`,
    `# Start Date: ${config.fecha_inicio}`,
    `# Duration: ${config.dias_cultivo} days`,
    `# Temperature: ${config.temperatura_ambiente}°C`,
    `# Light: ${config.luz}`,
    `# pH: ${config.ph}`,
    `# EC: ${config.ec} mS/cm`,
    ``,
  ];

  return [...metadata, headers.join(","), ...rows].join("\n");
}

export function downloadCSV(csvContent: string, filename: string): void {
  if (typeof window === "undefined") return;
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
