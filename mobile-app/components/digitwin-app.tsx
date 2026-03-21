"use client";

import { useApp } from "./app-provider";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { Dashboard } from "./screens/dashboard";
import { NewSimulation } from "./screens/new-simulation";
import { Results } from "./screens/results";
import { History } from "./screens/history";
import { Catalogue } from "./screens/catalogue";
import { Settings } from "./screens/settings";
import { Onboarding } from "./screens/onboarding";

export function DigiTwinApp() {
  const { currentScreen, onboardingComplete } = useApp();

  if (!onboardingComplete) {
    return <Onboarding />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard />;
      case "new-simulation":
        return <NewSimulation />;
      case "results":
        return <Results />;
      case "history":
        return <History />;
      case "catalogue":
        return <Catalogue />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{renderScreen()}</main>
      <BottomNav />
    </div>
  );
}
