"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Rocket, X } from "lucide-react";

interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  onSubmit: (name: string, description?: string) => void;
  isSubmitting?: boolean;
}

export default function CreateApplicationDialog({
  open,
  onOpenChange,
  defaultName = "My Application",
  onSubmit,
  isSubmitting,
}: CreateApplicationDialogProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setDescription("");
    }
  }, [open, defaultName]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, description.trim() || undefined);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Application</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Save your schema as a new application. You can open it in runtime mode
          without exposing the JSON.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="app-name" className="text-sm font-medium">
              Application name
            </label>
            <Input
              id="app-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Employee Registration"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="app-description" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="app-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this application"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()} className="gap-1.5">
              <Rocket className="h-3.5 w-3.5" />
              {isSubmitting ? "Creating…" : "Create Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
