// src/hooks/useFetchStatuses.js
import { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";

export const useFetchStatuses = (selectedProject, projectKey) => {
  const [statusOptions, setStatusOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatusOptions = async () => {
      if (!selectedProject) return;

      setIsLoading(true);
      setError(null);

      try {
        const statuses = await invoke("fetchStatuses", {
          projectKey: projectKey,
        });
        setStatusOptions(
          statuses.map((status) => ({
            label: status.name,
            value: status.id,
            statusCategory: status.statusCategory,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch statuses:", err);
        setError("Failed to load status options");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusOptions();
  }, [selectedProject, projectKey]);

  return { statusOptions, isLoading, error };
};
