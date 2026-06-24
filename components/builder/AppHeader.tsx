"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Save, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface AppHeaderProps {
  onSave?: () => void;
}

export default function AppHeader({ onSave }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch for theme icon
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  function handleSave() {
    onSave?.();
    toast.success("Schema saved!", {
      description: "Your form schema has been saved to local storage.",
      duration: 3000,
    });
  }

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-background/80 backdrop-blur-sm px-4 gap-4">
      {/* Brand */}
      <div className="flex items-center gap-2 select-none">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers className="h-3.5 w-3.5" />
        </div>
        <span className="font-semibold text-sm tracking-tight">AppForge</span>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500 border border-blue-500/20">
          <Sparkles className="h-2.5 w-2.5" />
          Builder
        </span>
      </div>

      {/* Divider */}
      <div className="hidden sm:block h-4 w-px bg-border" />

      {/* Center breadcrumb */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>My Apps</span>
        <span>/</span>
        <span className="text-foreground font-medium">Untitled Form</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {mounted ? (
            theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )
          ) : (
            <div className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* Save */}
        <Button size="sm" onClick={handleSave} className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          Save
        </Button>
      </div>
    </header>
  );
}
