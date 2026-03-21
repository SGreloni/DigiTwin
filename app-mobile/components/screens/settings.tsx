"use client";

import { useApp } from "@/components/app-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Moon, Sun, Globe, Trash2, Info, Sprout } from "lucide-react";
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
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {settings.darkMode ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            {lang === "es" ? "Apariencia" : "Appearance"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FieldLabel>
                    {lang === "es" ? "Modo oscuro" : "Dark mode"}
                  </FieldLabel>
                  <FieldDescription>
                    {lang === "es"
                      ? "Activa el tema oscuro de la aplicacion"
                      : "Enable dark theme for the application"}
                  </FieldDescription>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
                />
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {lang === "es" ? "Idioma" : "Language"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel>{lang === "es" ? "Idioma de la app" : "App language"}</FieldLabel>
              <Select
                value={settings.language}
                onValueChange={(v) => updateSettings({ language: v as "es" | "en" })}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Espanol</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

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
                  ? "Simulador de cultivos hidroponicos"
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
