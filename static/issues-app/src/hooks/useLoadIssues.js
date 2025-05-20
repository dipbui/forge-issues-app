import { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";

export const useLoadIssues = (selectedProject, currentPage, maxResults = 5) => {
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadIssues = async () => {
      if (!selectedProject?.id) return;

      setIsLoading(true);
      const startAt = (currentPage - 1) * maxResults;

      try {
        const data = await invoke("fetchIssues", {
          projectId: selectedProject.id,
          startAt,
          maxResults,
        });

        const groupedIssues = data.issues.reduce((acc, issue) => {
          if (issue.parentId) {
            const parent = data.issues.find((i) => i.id == issue.parentId);
            if (parent) {
              parent.children = [...(parent.children || []), issue];
            } else {
              acc.push(issue);
            }
          } else {
            acc.push(issue);
          }
          return acc;
        }, []);

        setIssues(groupedIssues);
        setTotal(data.total);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch issues:", err);
        setError("Failed to load issues. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadIssues();
  }, [selectedProject, currentPage, maxResults]);

  return { issues, total, error, isLoading };
};
