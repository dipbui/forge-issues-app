import { useState, useEffect } from "react";
import { invoke, view } from "@forge/bridge";

export const useLoadProjects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const context = await view.getContext();
        return context.extension?.project?.id;
      } catch (err) {
        console.error("Failed to get context:", err);
        return null;
      }
    };

    const loadProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const contextProjectId = await loadContext();
        const data = await invoke("fetchProjects");

        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          if (contextProjectId) {
            const contextProject = data.find((p) => p.id === contextProjectId);
            if (contextProject) {
              setSelectedProject(contextProject);
            }
          }
        } else {
          setError("No projects found. Ensure you have access to projects.");
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  return {
    projects,
    selectedProject,
    setSelectedProject,
    error,
    isLoading,
  };
};
