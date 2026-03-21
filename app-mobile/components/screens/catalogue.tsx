"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/components/app-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sprout, Thermometer, Sun, Droplets, Zap, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getCrops, getVarieties, DEFAULT_CROPS, DEFAULT_VARIETIES } from "@/lib/api";

interface CropData {
  name: string;
  varieties: string[];
  loading: boolean;
}

// Default variety parameters (mock data for display)
const VARIETY_INFO: Record<string, { tempRange: string; lightReq: string; phRange: string; ecRange: string }> = {
  "Barley_Hydroponic_Forage_AR_Moderate": {
    tempRange: "18-26°C",
    lightReq: "Media-Alta",
    phRange: "5.5-7.0",
    ecRange: "1.5-2.5 mS/cm",
  },
};

export function Catalogue() {
  const { settings } = useApp();
  const lang = settings.language;
  const [cropsData, setCropsData] = useState<CropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchCrops = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const response = await getCrops();
      const initialData: CropData[] = response.crops.map((crop) => ({
        name: crop,
        varieties: [],
        loading: true,
      }));
      setCropsData(initialData);
      setLoading(false);

      // Fetch varieties for each crop in parallel
      for (const crop of response.crops) {
        try {
          const varietiesResponse = await getVarieties(crop);
          setCropsData((prev) =>
            prev.map((c) =>
              c.name === crop
                ? { ...c, varieties: varietiesResponse.varieties, loading: false }
                : c
            )
          );
        } catch {
          // Fall back to known defaults for this specific crop
          const fallback = DEFAULT_VARIETIES[crop] ?? [];
          setCropsData((prev) =>
            prev.map((c) =>
              c.name === crop ? { ...c, varieties: fallback, loading: false } : c
            )
          );
        }
      }
    } catch {
      // API completely unreachable — show default data with a warning
      setFetchError(true);
      setCropsData(
        DEFAULT_CROPS.map((crop) => ({
          name: crop,
          varieties: DEFAULT_VARIETIES[crop] ?? [],
          loading: false,
        }))
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">
          {lang === "es" ? "Catalogo de Cultivos" : "Crop Catalogue"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "es"
            ? "Explora los cultivos y variedades disponibles"
            : "Explore available crops and varieties"}
        </p>
      </div>

      {fetchError && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0" />
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                {lang === "es"
                  ? "Sin conexion al servidor. Se muestran datos por defecto."
                  : "No server connection. Showing default data."}
              </p>
            </div>
            <button
              onClick={fetchCrops}
              className="flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-400 hover:underline shrink-0"
            >
              <RefreshCw className="h-3 w-3" />
              {lang === "es" ? "Reintentar" : "Retry"}
            </button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {cropsData.map((crop) => (
          <Card key={crop.name}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Sprout className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="capitalize">{crop.name}</CardTitle>
                  <CardDescription>
                    {crop.varieties.length}{" "}
                    {lang === "es"
                      ? crop.varieties.length === 1
                        ? "variedad"
                        : "variedades"
                      : crop.varieties.length === 1
                        ? "variety"
                        : "varieties"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {crop.loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {crop.varieties.map((variety, index) => {
                    const info = VARIETY_INFO[variety] || {
                      tempRange: "18-26°C",
                      lightReq: "Media",
                      phRange: "5.5-7.0",
                      ecRange: "1.5-2.5 mS/cm",
                    };

                    return (
                      <AccordionItem key={variety} value={`item-${index}`}>
                        <AccordionTrigger className="text-sm">
                          <div className="flex items-center gap-2">
                            <span>{variety.replace(/_/g, " ")}</span>
                            <Badge variant="secondary" className="text-xs">
                              {lang === "es" ? "Hidropónico" : "Hydroponic"}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="flex items-start gap-2">
                              <Thermometer className="h-4 w-4 text-chart-4 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {lang === "es" ? "Temperatura" : "Temperature"}
                                </p>
                                <p className="text-sm font-medium">{info.tempRange}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Sun className="h-4 w-4 text-chart-3 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  {lang === "es" ? "Luz" : "Light"}
                                </p>
                                <p className="text-sm font-medium">{info.lightReq}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Droplets className="h-4 w-4 text-chart-2 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">pH</p>
                                <p className="text-sm font-medium">{info.phRange}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Zap className="h-4 w-4 text-chart-5 mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">EC</p>
                                <p className="text-sm font-medium">{info.ecRange}</p>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            {lang === "es"
              ? "El catalogo se actualiza desde el servidor. Los parametros mostrados son valores recomendados."
              : "The catalogue is updated from the server. Displayed parameters are recommended values."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
