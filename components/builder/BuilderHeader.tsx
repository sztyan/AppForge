"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Save, ExternalLink, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import Link from "next/link";
import MainNav from "@/components/navigation/MainNav";

interface BuilderHeaderProps {
  appName?: string;
  appId?: string;
  onSave?: () => void;
  onCreateApplication?: () => void;
  isSaving?: boolean;
  isNew?: boolean;
}

export default function BuilderHeader({
  appName,
  appId,
  onSave,
  onCreateApplication,
  isSaving,
  isNew,
}: BuilderHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  function handleSave() {
    onSave?.();
    if (!isNew) {
      toast.success("Schema saved!", {
        description: "Your form schema has been updated.",
        duration: 3000,
      });
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-background/80 backdrop-blur-sm px-4 gap-4">
      <MainNav />

      <div className="hidden sm:block h-4 w-px bg-border" />

      <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
        <span>Builder</span>
        <span>/</span>
        <span className="text-foreground font-medium truncate">
          {appName ?? (isNew ? "New Application" : "Untitled Form")}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {appId && (
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href={`/app/${appId}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open App</span>
            </Link>
          </Button>
        )}

        {isNew ? (
          <Button
            size="sm"
            onClick={onCreateApplication}
            disabled={isSaving}
            className="gap-1.5"
          >
            <Rocket className="h-3.5 w-3.5" />
            Create Application
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        )}

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
      </div>
    </header>
  );
}
