import api, { route } from "@forge/api";

export async function fetchProjectRoles({ projectId }) {
  try {
    const response = await api
      .asApp()
      .requestJira(route`/rest/api/2/project/${projectId}/role`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Project roles API error:", errorData);
      throw new Error(
        `Failed to fetch project roles: ${
          errorData.message || response.statusText
        }`
      );
    }

    const roles = await response.json();
    return Object.entries(roles).map(([name, url]) => ({
      name,
      id: url.split("/").pop(),
    }));
  } catch (err) {
    console.error("Failed to fetch project roles:", err);
    throw err;
  }
}

export async function fetchUsersForRole({ projectId, roleId }) {
  try {
    const response = await api
      .asApp()
      .requestJira(route`/rest/api/2/project/${projectId}/role/${roleId}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Users for role API error:", errorData);
      throw new Error(
        `Failed to fetch users for role: ${
          errorData.message || response.statusText
        }`
      );
    }

    const roleData = await response.json();
    return roleData.actors.map((actor) => ({
      displayName: actor.displayName,
      accountId: actor.name,
    }));
  } catch (err) {
    console.error("Failed to fetch users for role:", err);
    throw err;
  }
}

export async function updateIssue({ issueId, fields }) {
  console.log("Received update request for:", issueId, fields);

  if (!fields) {
    throw new Error("Fields parameter is required");
  }

  try {
    const requestBody = {
      fields: {
        summary: fields.summary,
        ...(fields.description && {
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: fields.description }],
              },
            ],
          },
        }),
        assignee: fields.assignee ? { accountId: fields.assignee } : null,
      },
    };

    if (fields.status) {
      const transitionsResponse = await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueId}/transitions`);

      if (!transitionsResponse.ok) {
        throw new Error("Failed to get available transitions");
      }

      const transitionsData = await transitionsResponse.json();
      console.log("Available transitions:", transitionsData);
      const targetTransition = transitionsData.transitions.find(
        (t) => t.to.name.toLowerCase() === fields.status.toLowerCase()
      );

      if (!targetTransition) {
        console.warn(`No transition found for status: ${fields.status}`);
      } else {
        console.log("Executing transition:", targetTransition);
        const transitionResponse = await api
          .asApp()
          .requestJira(route`/rest/api/3/issue/${issueId}/transitions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transition: { id: targetTransition.id } }),
          });

        if (!transitionResponse.ok) {
          throw new Error("Failed to update issue status");
        }
      }
    }

    if (
      requestBody.fields.summary ||
      requestBody.fields.description ||
      requestBody.fields.assignee
    ) {
      const response = await api
        .asApp()
        .requestJira(route`/rest/api/3/issue/${issueId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Jira API error details:", errorData);
        throw new Error(errorData.message || "Failed to update issue fields");
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Update failed:", err);
    throw new Error(err.message || "Failed to update issue");
  }
}
