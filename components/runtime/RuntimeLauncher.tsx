"use client";

import Link from "next/link";
import { Loader2, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApplications } from "@/hooks/use-applications";

export default function RuntimeLauncher() {
  const { applications, loading } = useApplications();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading applications…</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Runtime</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Launch generated applications. Runtime mode renders forms without
            exposing the underlying JSON schema.
          </p>
        </div>

        {applications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Play className="h-10 w-10 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-foreground">No apps to run</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Create an application in the Builder first, then return here to
                launch it in runtime mode.
              </p>
              <Button asChild className="mt-6 gap-1.5">
                <Link href="/builder">Go to Builder</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">{app.name}</CardTitle>
                    <Badge variant="outline" className="shrink-0">
                      /app/{app.id.slice(0, 8)}…
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {app.schema.title || app.description || "Generated form application"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    /app/{app.id}
                  </p>
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm" asChild className="gap-1.5 flex-1">
                    <Link href={`/app/${app.id}`}>
                      <Play className="h-3.5 w-3.5" />
                      Launch
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon-sm" asChild>
                    <Link href={`/app/${app.id}`} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
