"use client";

/**
 * BuilderLayout — resizable split-panel layout.
 * Uses a native <input type="range"> overlaid on the divider for drag-to-resize.
 * CSS variables drive the column widths for smooth, jank-free resizing.
 */

import { useCallback, useRef, useState } from "react";
import { Code2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface BuilderLayoutProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
}

export default function BuilderLayout({ editor, preview }: BuilderLayoutProps) {
  const [splitPct, setSplitPct] = useState(50); // left panel width %
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // ── Mouse-drag resize ──────────────────────────────────────────────────────
  const onDividerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const rawPct = ((moveEvent.clientX - rect.left) / rect.width) * 100;
        setSplitPct(Math.min(80, Math.max(20, rawPct)));
      };

      const onUp = () => {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col md:flex-row flex-1 overflow-hidden"
      style={{ "--split-width": `${splitPct}%` } as React.CSSProperties}
    >
      {/* ── Left Panel (Editor) ────────────────────────────────────────────── */}
      <div
        className="flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-border w-full md:w-[var(--split-width)] h-[380px] md:h-full"
        style={{ minWidth: "200px" }}
      >
        {/* Panel header */}
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-muted/40 px-4">
          <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            JSON Schema
          </span>
          <div className="flex-1" />
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            editor
          </span>
        </div>

        {/* Editor slot */}
        <div className="flex-1 overflow-hidden">{editor}</div>
      </div>

      {/* ── Drag Divider ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          "hidden md:flex w-3 shrink-0 cursor-col-resize items-center justify-center relative",
          "hover:bg-primary/5 transition-colors duration-150 group"
        )}
        onMouseDown={onDividerMouseDown}
        title="Drag to resize"
      >
        {/* Sleek visible line */}
        <div className="absolute inset-y-0 left-1.5 w-px bg-border group-hover:bg-primary/50 group-active:bg-primary transition-colors" />

        {/* Visual handle dots */}
        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary/40" />
          ))}
        </div>
      </div>

      {/* ── Right Panel (Preview) ──────────────────────────────────────────── */}
      <div
        className="flex flex-col overflow-hidden flex-1 h-[calc(100vh-380px-56px)] md:h-full"
        style={{ minWidth: "200px" }}
      >
        {/* Panel header */}
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-muted/40 px-4">
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Live Preview
          </span>
          <div className="flex-1" />
          <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            live
          </span>
        </div>

        {/* Preview slot */}
        <div className="flex-1 overflow-auto bg-muted/20 p-6">{preview}</div>
      </div>
    </div>
  );
}

