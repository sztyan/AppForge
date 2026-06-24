"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    return (
      <button
        onClick={() => signIn("google")}
        className="ml-3 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="ml-3 flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:inline">{session.user?.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-md border px-2 py-1 text-xs"
      >
        Sign out
      </button>
    </div>
  );
}
