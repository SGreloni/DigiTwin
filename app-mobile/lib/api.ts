// DigiTwin API Layer
// All API calls are centralized here for React Native exportability

import type {
  CropsResponse,
  VarietiesResponse,
  SimulationConfig,
  SimulationResult,
  HealthResponse,
} from "./types";

// Base URL - configurable for different environments
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorData?.detail || `HTTP error ${response.status}`,
      errorData
    );
  }
  return response.json();
}

// Health check
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<HealthResponse>(response);
}

// Crops catalogue
export async function getCrops(): Promise<CropsResponse> {
  const response = await fetch(`${API_BASE_URL}/crops`);
  return handleResponse<CropsResponse>(response);
}

// Varieties for a crop
export async function getVarieties(cropName: string): Promise<VarietiesResponse> {
  const response = await fetch(`${API_BASE_URL}/crops/${encodeURIComponent(cropName)}/varieties`);
  return handleResponse<VarietiesResponse>(response);
}

// Run simulation
export async function runSimulation(config: Partial<SimulationConfig>): Promise<SimulationResult> {
  const response = await fetch(`${API_BASE_URL}/simulations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
  return handleResponse<SimulationResult>(response);
}

// Export for use in React Native or web
export { ApiError, API_BASE_URL };

// Default config values (matching API defaults)
export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  crop_name: "barley",
  variety_name: "Barley_Hydroponic_Forage_AR_Moderate",
  fecha_inicio: new Date().toISOString().split("T")[0],
  dias_cultivo: 10,
  temperatura_ambiente: 22.0,
  luz: "media",
  ph: 6.0,
  ec: 2.0,
};

// Light level labels for UI
export const LIGHT_LEVEL_LABELS: Record<string, { es: string; en: string }> = {
  baja: { es: "Baja", en: "Low" },
  media: { es: "Media", en: "Medium" },
  alta: { es: "Alta", en: "High" },
};

// Fallback data shown when the API is unreachable
export const DEFAULT_CROPS: string[] = ["barley"];

export const DEFAULT_VARIETIES: Record<string, string[]> = {
  barley: ["Barley_Hydroponic_Forage_AR_Moderate"],
};
