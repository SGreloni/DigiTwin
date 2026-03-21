"use client";

import { useApp } from "@/components/app-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field";

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
import { Trash2, Info, Sprout } from "lucide-react";
import { clearAllSimulations } from "@/lib/storage";

export function Settings() {
  const { settings, updateSettings } = useApp();
  const lang = settings.language;

  const handleClearHistory = () => {
    clearAllSimulations();
    // Force a refresh
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            {lang === "es" ? "Datos" : "Data"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FieldLabel>
                    {lang === "es" ? "Borrar historial" : "Clear history"}
                  </FieldLabel>
                  <FieldDescription>
                    {lang === "es"
                      ? "Elimina todas las simulaciones guardadas"
                      : "Delete all saved simulations"}
                  </FieldDescription>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      {lang === "es" ? "Borrar" : "Clear"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {lang === "es"
                          ? "Borrar todo el historial?"
                          : "Clear all history?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {lang === "es"
                          ? "Esta accion eliminara permanentemente todas tus simulaciones guardadas. Esta accion no se puede deshacer."
                          : "This action will permanently delete all your saved simulations. This action cannot be undone."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {lang === "es" ? "Cancelar" : "Cancel"}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearHistory}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {lang === "es" ? "Borrar todo" : "Clear all"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            {lang === "es" ? "Acerca de" : "About"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Sprout className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">DigiTwin</h3>
              <p className="text-sm text-muted-foreground">
                {lang === "es"
                  ? "Simulador de cultivos hidropónicos"
                  : "Hydroponic crop simulator"}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {lang === "es" ? "Version" : "Version"}
              </span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {lang === "es" ? "Motor" : "Engine"}
              </span>
              <span className="font-mono">PCSE/WOFOST</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center">
            {lang === "es"
              ? "Desarrollado para agricultura de precision"
              : "Developed for precision agriculture"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
