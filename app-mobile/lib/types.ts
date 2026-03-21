// DigiTwin API Types - Designed for React Native exportability

export type LightLevel = "baja" | "media" | "alta";

export interface SimulationConfig {
  crop_name: string;
  variety_name: string;
  fecha_inicio: string; // ISO date YYYY-MM-DD
  dias_cultivo: number;
  temperatura_ambiente: number;
  luz: LightLevel;
  ph: number;
  ec: number;
}

export interface DailyResult {
  day: string;
  DVS: number;  // Development Stage
  LAI: number;  // Leaf Area Index
  TAGP: number; // Total Above-Ground Production (kg/ha)
  TWSO: number; // Total Weight Storage Organs (yield, kg/ha)
  TWLV: number; // Total Weight Leaves
  TWST: number; // Total Weight Stems
  TWRT: number; // Total Weight Roots
  TRA: number;  // Transpiration
  RD: number;   // Root Depth
  SM: number;   // Soil Moisture
  WWLOW: number;
  RFTRA: number;
}

export interface SimulationSummary {
  final_DVS: number;
  final_LAI: number;
  final_TAGP: number;
  final_TWSO: number;
}

export interface SimulationResult {
  config: SimulationConfig;
  summary: SimulationSummary;
  daily_results: DailyResult[];
}

export interface CropsResponse {
  crops: string[];
}

export interface VarietiesResponse {
  crop_name: string;
  varieties: string[];
}

export interface HealthResponse {
  status: string;
  version: string;
}

// Local storage types
export interface StoredSimulation {
  id: string;
  createdAt: string;
  config: SimulationConfig;
  summary: SimulationSummary;
  daily_results: DailyResult[];
}

// App state types
export type AppScreen = 
  | "onboarding"
  | "dashboard"
  | "new-simulation"
  | "results"
  | "history"
  | "catalogue"
  | "settings";

export interface AppSettings {
  darkMode: boolean;
  language: "es" | "en";
}
