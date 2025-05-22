import { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";

export const useLoadIssues = (selectedProject, currentPage, maxResults = 5) => {
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  console.log("issues", issues);
  useEffect(() => {
    const loadIssues = async () => {
      if (!selectedProject?.id) return;

      setIsLoading(true);

      try {
        // Fetch all issues without pagination to ensure proper grouping
        const data = await invoke("fetchIssues", {
          projectId: selectedProject.id,

          startAt: 0,
          maxResults: -1, // or a very large number to get all issues
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

        // Handle pagination on the frontend
        const startIndex = (currentPage - 1) * maxResults;
        const endIndex = startIndex + maxResults;
        const paginatedIssues = groupedIssues.slice(startIndex, endIndex);

        setIssues(paginatedIssues);
        setTotal(groupedIssues.length);
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
