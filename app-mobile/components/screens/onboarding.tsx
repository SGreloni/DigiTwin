"use client";

import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, TrendingUp, BarChart3, Smartphone, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    icon: Sprout,
    title: { es: "Bienvenido a DigiTwin", en: "Welcome to DigiTwin" },
    description: {
      es: "Tu gemelo digital para el cultivo hidroponico de cebada forrajera y otros cultivos.",
      en: "Your digital twin for hydroponic forage barley and other crop cultivation.",
    },
  },
  {
    icon: TrendingUp,
    title: { es: "Simulaciones Precisas", en: "Accurate Simulations" },
    description: {
      es: "Basado en el motor PCSE/WOFOST, obtén predicciones de crecimiento confiables para tus cultivos.",
      en: "Based on the PCSE/WOFOST engine, get reliable growth predictions for your crops.",
    },
  },
  {
    icon: BarChart3,
    title: { es: "Visualiza Resultados", en: "Visualize Results" },
    description: {
      es: "Graficos detallados de desarrollo, produccion, indice foliar y mas metricas clave.",
      en: "Detailed charts of development, production, leaf area index, and more key metrics.",
    },
  },
  {
    icon: Smartphone,
    title: { es: "En Cualquier Lugar", en: "Anywhere" },
    description: {
      es: "Accede a tus simulaciones desde cualquier dispositivo. Historial offline incluido.",
      en: "Access your simulations from any device. Offline history included.",
    },
  },
];

export function Onboarding() {
  const { completeOnboarding, settings } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const lang = settings.language;

  const isLastSlide = currentSlide === SLIDES.length - 1;

  const nextSlide = () => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Sprout className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">DigiTwin</span>
        </div>

        {/* Slide Content */}
        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center text-center p-6 space-y-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-12 w-12 text-primary" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold">{slide.title[lang]}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {slide.description[lang]}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentSlide > 0 && (
            <Button variant="outline" className="flex-1" onClick={prevSlide}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {lang === "es" ? "Anterior" : "Back"}
            </Button>
          )}
          
          <Button
            className={cn("flex-1", currentSlide === 0 && "w-full")}
            onClick={nextSlide}
          >
            {isLastSlide
              ? lang === "es"
                ? "Comenzar"
                : "Get Started"
              : lang === "es"
              ? "Siguiente"
              : "Next"}
            {!isLastSlide && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>

        {/* Skip Button */}
        {!isLastSlide && (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={completeOnboarding}
          >
            {lang === "es" ? "Omitir" : "Skip"}
          </Button>
        )}
      </div>
    </div>
  );
}
