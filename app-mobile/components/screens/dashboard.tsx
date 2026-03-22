"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, Calendar, Droplets, PlusCircle, ArrowRight } from "lucide-react";
import { getStoredSimulations } from "@/lib/storage";
import type { StoredSimulation } from "@/lib/types";

export function Dashboard() {
  const { navigateTo, setSelectedHistoryItem, settings } = useApp();
  const [lastSimulation, setLastSimulation] = useState<StoredSimulation | null>(null);
  const lang = settings.language;

  useEffect(() => {
    const simulations = getStoredSimulations();
    if (simulations.length > 0) {
      setLastSimulation(simulations[0]);
    }
  }, []);

  const viewLastSimulation = () => {
    if (lastSimulation) {
      setSelectedHistoryItem(lastSimulation);
      navigateTo("results");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      {/* Welcome Section */}
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {lang === "es" ? "Bienvenido a DigiTwin" : "Welcome to DigiTwin"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "es"
            ? "Simula el crecimiento de tus cultivos hidropónicos"
            : "Simulate the growth of your hydroponic crops"}
        </p>
      </section>
      {/* Feature Cards */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          {lang === "es" ? "Caracteristicas" : "Features"}
        </h2>
        <div className="grid gap-3">
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-chart-1/20">
                  <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
                </span>
                {lang === "es" ? "Predicciones precisas" : "Accurate predictions"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {lang === "es"
                  ? "Basado en el modelo PCSE/WOFOST de simulacion de cultivos"
                  : "Based on the PCSE/WOFOST crop simulation model"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-chart-2/20">
                  <Droplets className="h-3.5 w-3.5 text-chart-2" />
                </span>
                {lang === "es" ? "Hidropónicos" : "Hydroponics"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {lang === "es"
                  ? "Optimizado para cultivos hidropónicos de cebada forrajera"
                  : "Optimized for hydroponic forage barley cultivation"}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Last Simulation */}
      {lastSimulation && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {lang === "es" ? "Última Simulación" : "Last Simulation"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => navigateTo("history")}
            >
              {lang === "es" ? "Ver todo" : "View all"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <Card
              className="cursor-pointer transition-colors hover:bg-accent/50"
              onClick={viewLastSimulation}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base capitalize">
                      {lastSimulation.config.crop_name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {lastSimulation.config.variety_name.replace(/_/g, " ")}
                    </CardDescription>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Sprout className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">
                        {lang === "es" ? "Fecha" : "Date"}
                      </span>
                    </div>
                    <p className="font-medium">
                      {formatDate(lastSimulation.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="text-xs">
                        {lang === "es" ? "Rend." : "Yield"}
                      </span>
                    </div>
                    <p className="font-medium">
                      {lastSimulation.summary.final_TWSO.toFixed(1)}
                      <span className="text-xs text-muted-foreground ml-1">kg/ha</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Droplets className="h-3.5 w-3.5" />
                      <span className="text-xs">LAI</span>
                    </div>
                    <p className="font-medium">
                      {lastSimulation.summary.final_LAI.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Button className="text-center" onClick={() => navigateTo("new-simulation")}>
              {lang === "es" ? "Nueva simulación" : "New simulation"}
            </Button>
          </div>
        </section>
      )}

      {/* Getting Started (when no simulations) */}
      {!lastSimulation && (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">
              {lang === "es" ? "Comienza tu primera simulación" : "Start your first simulation"}
            </CardTitle>
            <CardDescription>
              {lang === "es"
                ? "Configura los parametros de tu cultivo y observa las predicciones de crecimiento"
                : "Configure your crop parameters and view growth predictions"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigateTo("new-simulation")}>
              {lang === "es" ? "Crear simulación" : "Create simulation"}
            </Button>
          </CardContent>
        </Card>
      )}


    </div>
  );
}
