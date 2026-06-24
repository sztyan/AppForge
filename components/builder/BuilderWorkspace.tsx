"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import BuilderHeader from "@/components/builder/BuilderHeader";
import BuilderLayout from "@/components/builder/BuilderLayout";
import JsonEditor from "@/components/builder/JsonEditor";
import LivePreview from "@/components/builder/LivePreview";
import { DEFAULT_SCHEMA_JSON } from "@/lib/default-schema";
import type { FormSchema } from "@/lib/types";
import { validateFormSchema } from "@/lib/schema";
import { getApplicationStore } from "@/lib/applications";
import CreateApplicationDialog from "@/components/applications/CreateApplicationDialog";

interface BuilderWorkspaceProps {
  appId?: string;
  initialJson?: string;
  initialName?: string;
}

function parseSchema(json: string): FormSchema | null {
  try {
    return JSON.parse(json) as FormSchema;
  } catch {
    return null;
  }
}

export default function BuilderWorkspace({
  appId,
  initialJson = DEFAULT_SCHEMA_JSON,
  initialName,
}: BuilderWorkspaceProps) {
  const router = useRouter();
  const [json, setJson] = useState(initialJson);
  const [appName, setAppName] = useState(initialName ?? "New Application");
  const [isSaving, setIsSaving] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const isNew = !appId;

  const handleSave = useCallback(async () => {
    if (!appId) return;

    const schema = parseSchema(json);
    if (!schema) {
      toast.error("Invalid JSON", { description: "Fix syntax errors before saving." });
      return;
    }

    const validation = validateFormSchema(schema);
    if (validation.hasCriticalErrors) {
      toast.error("Schema validation failed", {
        description: validation.errors[0] ?? "Fix critical errors before saving.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const title = schema.title?.trim();
      await getApplicationStore().update(appId, {
        schema,
        name: title || appName,
      });
      if (title) setAppName(title);
    } catch {
      toast.error("Failed to save", { description: "Could not persist schema." });
    } finally {
      setIsSaving(false);
    }
  }, [appId, json, appName]);

  const handleCreateApplication = useCallback(
    async (name: string, description?: string) => {
      const schema = parseSchema(json);
      if (!schema) {
        toast.error("Invalid JSON", { description: "Fix syntax errors before creating." });
        return;
      }

      const validation = validateFormSchema(schema);
      if (validation.hasCriticalErrors) {
        toast.error("Schema validation failed", {
          description: validation.errors[0] ?? "Fix critical errors before creating.",
        });
        return;
      }

      setIsSaving(true);
      try {
        const app = await getApplicationStore().create({
          name,
          description,
          schema: { ...schema, title: schema.title ?? name },
        });
        setShowCreateDialog(false);
        toast.success("Application created!", {
          description: `"${name}" is ready to use.`,
        });
        router.push(`/builder/${app.id}`);
      } catch {
        toast.error("Failed to create", { description: "Could not create application." });
      } finally {
        setIsSaving(false);
      }
    },
    [json, router]
  );

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        <BuilderHeader
          appName={appName}
          appId={appId}
          onSave={handleSave}
          onCreateApplication={() => setShowCreateDialog(true)}
          isSaving={isSaving}
          isNew={isNew}
        />
        <BuilderLayout
          editor={<JsonEditor value={json} onChange={setJson} />}
          preview={<LivePreview json={json} />}
        />
      </div>

      <CreateApplicationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        defaultName={parseSchema(json)?.title ?? "My Application"}
        onSubmit={handleCreateApplication}
        isSubmitting={isSaving}
      />
    </>
  );
}
