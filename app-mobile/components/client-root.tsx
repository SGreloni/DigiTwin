"use client";

import { AppProvider } from "@/components/app-provider";
import { DigiTwinApp } from "@/components/digitwin-app";

export function ClientRoot() {
  return (
    <AppProvider>
      <DigiTwinApp />
    </AppProvider>
  );
}
