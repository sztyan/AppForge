"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Play,
  Trash2,
  Loader2,
  LayoutGrid,
  Calendar,
} from "lucide-react";
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
import { toast } from "sonner";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ApplicationList() {
  const router = useRouter();
  const { applications, loading, deleteApplication } = useApplications();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteApplication(id);
      toast.success("Application deleted");
    } catch {
      toast.error("Failed to delete application");
    }
  }

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage generated applications. Edit schemas in Builder or open in Runtime.
            </p>
          </div>
          <Button onClick={() => router.push("/builder")} className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>

        {applications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <LayoutGrid className="h-10 w-10 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-foreground">No applications yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Create your first application in the Builder. Define a JSON schema,
                save it, and open the generated form in Runtime mode.
              </p>
              <Button
                onClick={() => router.push("/builder")}
                className="mt-6 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Start Building
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => (
              <Card key={app.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">{app.name}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {app.schema.layout ?? "form"}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {app.description ||
                      app.schema.description ||
                      "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Updated {formatDate(app.updatedAt)}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild className="gap-1.5">
                    <Link href={`/builder/${app.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="gap-1.5">
                    <Link href={`/app/${app.id}/api-docs`}>
                      API
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="gap-1.5">
                    <Link href={`/app/${app.id}`}>
                      <Play className="h-3.5 w-3.5" />
                      Open
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive ml-auto"
                    onClick={() => void handleDelete(app.id, app.name)}
                    aria-label={`Delete ${app.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
