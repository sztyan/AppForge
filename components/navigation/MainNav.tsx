"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, LayoutGrid, Play, Sparkles } from "lucide-react";
import AuthButton from "@/components/ui/AuthButton";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/builder", label: "Builder", icon: Sparkles },
  { href: "/applications", label: "Applications", icon: LayoutGrid },
  { href: "/runtime", label: "Runtime", icon: Play },
] as const;

export default function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between w-full">
      <nav className="flex items-center gap-1">
      <Link
        href="/applications"
        className="flex items-center gap-2 select-none mr-2"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers className="h-3.5 w-3.5" />
        </div>
        <span className="font-semibold text-sm tracking-tight hidden sm:inline">
          AppForge
        </span>
      </Link>

      <div className="hidden sm:block h-4 w-px bg-border mr-1" />

      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{label}</span>
          </Link>
        );
      })}
      </nav>
      <AuthButton />
    </div>
  );
}
