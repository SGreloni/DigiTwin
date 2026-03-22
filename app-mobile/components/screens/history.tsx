"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/components/app-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Empty } from "@/components/ui/empty";
import { Sprout, Calendar, TrendingUp, Trash2, ChevronRight, History as HistoryIcon } from "lucide-react";
import { getStoredSimulations, deleteSimulation } from "@/lib/storage";
import type { StoredSimulation } from "@/lib/types";

export function History() {
  const { navigateTo, setSelectedHistoryItem, settings } = useApp();
  const lang = settings.language;
  const [simulations, setSimulations] = useState<StoredSimulation[]>([]);

  const loadSimulations = useCallback(() => {
    setSimulations(getStoredSimulations());
  }, []);

  useEffect(() => {
    loadSimulations();
  }, [loadSimulations]);

  const handleDelete = (id: string) => {
    deleteSimulation(id);
    loadSimulations();
  };

  const handleView = (simulation: StoredSimulation) => {
    setSelectedHistoryItem(simulation);
    navigateTo("results");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (simulations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 min-h-[60vh]">
        <Empty
          title={lang === "es" ? "Sin simulaciones" : "No simulations"}
          description={
            lang === "es"
              ? "Aun no has realizado ninguna simulación"
              : "You haven't run any simulations yet"
          }
        >
          <HistoryIcon className="h-12 w-12 text-muted-foreground/50" />
        </Empty>
        <Button onClick={() => navigateTo("new-simulation")}>
          {lang === "es" ? "Crear primera simulación" : "Create first simulation"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {lang === "es" ? "Simulaciones guardadas" : "Saved simulations"}
        </h2>
        <span className="text-sm text-muted-foreground">
          {simulations.length} {lang === "es" ? "total" : "total"}
        </span>
      </div>

      <div className="space-y-3">
        {simulations.map((simulation) => (
          <Card
            key={simulation.id}
            className="overflow-hidden transition-colors hover:bg-accent/30"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                    <Sprout className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base capitalize">
                      {simulation.config.crop_name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5 line-clamp-1">
                      {simulation.config.variety_name.replace(/_/g, " ")}
                    </CardDescription>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{lang === "es" ? "Eliminar" : "Delete"}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {lang === "es" ? "Eliminar simulación" : "Delete simulation"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {lang === "es"
                          ? "Esta accion no se puede deshacer. Se eliminara permanentemente esta simulación."
                          : "This action cannot be undone. This will permanently delete this simulation."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {lang === "es" ? "Cancelar" : "Cancel"}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(simulation.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {lang === "es" ? "Eliminar" : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>

            <CardContent>
              <button
                onClick={() => handleView(simulation)}
                className="w-full text-left"
              >
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">{lang === "es" ? "Fecha" : "Date"}</span>
                    </div>
                    <p className="text-xs font-medium">
                      {formatDate(simulation.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span className="text-xs">LAI</span>
                    </div>
                    <p className="text-xs font-medium">
                      {simulation.summary.final_LAI.toFixed(3)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{simulation.config.dias_cultivo} {lang === "es" ? "dias" : "days"}</span>
                    <span>|</span>
                    <span>{simulation.config.temperatura_ambiente}°C</span>
                    <span>|</span>
                    <span>pH {simulation.config.ph}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
