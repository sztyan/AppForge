"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getApplicationStore,
  type Application,
  type CreateApplicationInput,
  type UpdateApplicationInput,
} from "@/lib/applications";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const apps = await getApplicationStore().list();
      setApplications(apps);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const createApplication = useCallback(
    async (input: CreateApplicationInput) => {
      const app = await getApplicationStore().create(input);
      await refresh();
      return app;
    },
    [refresh]
  );

  const updateApplication = useCallback(
    async (id: string, input: UpdateApplicationInput) => {
      const app = await getApplicationStore().update(id, input);
      await refresh();
      return app;
    },
    [refresh]
  );

  const deleteApplication = useCallback(
    async (id: string) => {
      await getApplicationStore().delete(id);
      await refresh();
    },
    [refresh]
  );

  const getApplication = useCallback(async (id: string) => {
    return getApplicationStore().getById(id);
  }, []);

  return {
    applications,
    loading,
    refresh,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplication,
  };
}
