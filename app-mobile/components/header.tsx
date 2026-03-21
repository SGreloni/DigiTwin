"use client";

import { useApp } from "./app-provider";
import { Button } from "@/components/ui/button";
import { Sprout, ArrowLeft, Home, History, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
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

export function Header() {
  const { currentScreen, navigateTo, settings } = useApp();
  const lang = settings.language;
  const showBack = currentScreen !== "dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">

        {/* Mobile: back button or logo */}
        <div className="flex items-center gap-2 md:hidden">
          {showBack ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateTo("dashboard")}
              aria-label={lang === "es" ? "Volver" : "Back"}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sprout className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">DigiTwin</span>
            </>
          )}
        </div>

        {/* Desktop: logo always visible on the left */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sprout className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">DigiTwin</span>
        </div>

        {/* Desktop: inline nav buttons (same distribution as bottom nav) */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = currentScreen === item.screen;
            const Icon = item.icon;
            return (
              <button
                key={item.screen}
                onClick={() => navigateTo(item.screen)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label[lang]}
              </button>
            );
          })}
        </nav>

        {/* Desktop: spacer to balance the logo on the left */}
        <div className="hidden md:block w-[160px]" />
      </div>
    </header>
  );
}
