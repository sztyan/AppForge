"use client";

import MainNav from "./MainNav";

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center border-b border-border bg-background/80 backdrop-blur-sm px-4">
        <MainNav />
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
