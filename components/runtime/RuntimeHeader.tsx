"use client";

import Link from "next/link";
import { BookOpen, Layers } from "lucide-react";
import LocaleSwitcher from "./LocaleSwitcher";

interface RuntimeHeaderProps {
  appId: string;
  appName?: string;
  locales?: string[];
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
}

export default function RuntimeHeader({
  appId,
  appName,
  locales = [],
  currentLocale,
  onLocaleChange,
}: RuntimeHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4 gap-4">
      <Link
        href="/applications"
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors min-w-0"
      >
        <Layers className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{appName ?? "AppForge"}</span>
      </Link>

      <div className="flex items-center gap-3">
        {locales.length > 1 && currentLocale && onLocaleChange && (
          <LocaleSwitcher
            locales={locales}
            current={currentLocale}
            onChange={onLocaleChange}
          />
        )}
        <Link
          href={`/app/${appId}/api-docs`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">API Docs</span>
        </Link>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
          Runtime
        </span>
      </div>
    </header>
  );
}
