import { useState, useEffect } from "react";
import { invoke } from "@forge/bridge";

export const useLoadAssignees = (selectedProject) => {
  const [assignees, setAssignees] = useState([
    { label: "Unassigned", value: null },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAssignees = async () => {
      if (!selectedProject?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const roles = await invoke("fetchProjectRoles", {
          projectId: selectedProject.id,
        });

        if (roles.length === 0) {
          setIsLoading(false);
          return;
        }

        let allUsers = [];
        for (const role of roles) {
          const users = await invoke("fetchUsersForRole", {
            projectId: selectedProject.id,
            roleId: role.id,
          });
          allUsers = [...users];
        }

        const uniqueAssignees = Array.from(
          new Map(allUsers.map((user) => [user.accountId, user])).values()
        );

        const assigneeOptions =
          uniqueAssignees.length > 0
            ? [
                { label: "Unassigned", value: null },
                ...uniqueAssignees.map((user) => ({
                  label: user.displayName,
                  value: user.accountId,
                })),
              ]
            : [{ label: "Unassigned", value: null }];

        setAssignees(assigneeOptions);
      } catch (err) {
        console.error("Failed to fetch assignees:", err);
        setError(`Failed to load assignees: ${err.message || "Unknown error"}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignees();
  }, [selectedProject]);

  return { assignees, isLoading, error };
};
