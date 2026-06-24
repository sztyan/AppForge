"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  locales: string[];
  current: string;
  onChange: (locale: string) => void;
}

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export default function LocaleSwitcher({ locales, current, onChange }: LocaleSwitcherProps) {
  if (locales.length <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-3.5 w-3.5 text-muted-foreground mr-1" />
      {locales.map((locale) => (
        <Button
          key={locale}
          variant={locale === current ? "secondary" : "ghost"}
          size="xs"
          onClick={() => onChange(locale)}
          className={cn("text-xs", locale === current && "font-semibold")}
        >
          {LOCALE_LABELS[locale] ?? locale.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
