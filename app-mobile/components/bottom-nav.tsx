"use client";

import { useApp } from "./app-provider";
import { cn } from "@/lib/utils";
import { Home, History, BookOpen, Settings } from "lucide-react";
import type { AppScreen } from "@/lib/types";

const NAV_ITEMS: Array<{
  screen: AppScreen;
  icon: typeof Home;
  label: { es: string; en: string };
}> = [
  { screen: "dashboard", icon: Home, label: { es: "Inicio", en: "Home" } },
  { screen: "history", icon: History, label: { es: "Historial", en: "History" } },
  { screen: "catalogue", icon: BookOpen, label: { es: "Catalogo", en: "Catalogue" } },
  { screen: "settings", icon: Settings, label: { es: "Ajustes", en: "Settings" } },
];

export function BottomNav() {
  const { currentScreen, navigateTo, settings } = useApp();
  const lang = settings.language;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-pb">
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = currentScreen === item.screen;
          const Icon = item.icon;

          return (
            <button
              key={item.screen}
              onClick={() => navigateTo(item.screen)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[4rem]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span className="text-xs font-medium">{item.label[lang]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
