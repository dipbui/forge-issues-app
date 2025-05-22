import Resolver from "@forge/resolver";
import { fetchProjects } from "./api/fetchProjects";
import { fetchIssues } from "./api/fetchIssues";
import { deleteIssue, deleteIssueWithSubtasks } from "./api/deleteIssue";
import { updateIssue } from "./api/updateIssue";
import api, { route } from "@forge/api";
import { fetchStatuses } from "./api/fetchStatuses";

const resolver = new Resolver();

resolver.define("fetchProjects", async () => {
  return await fetchProjects();
});

resolver.define("fetchIssues", async ({ payload }) => {
  const { projectId, startAt, maxResults } = payload;
  return await fetchIssues(projectId, startAt, maxResults);
});

resolver.define("deleteIssue", async ({ payload }) => {
  const { issueId } = payload;
  return await deleteIssue(issueId);
});

resolver.define("deleteIssueWithSubtasks", async ({ payload }) => {
  const { issueId } = payload;
  return await deleteIssueWithSubtasks(issueId);
});

resolver.define("updateIssue", async ({ payload }) => {
  return await updateIssue(payload);
});

resolver.define("getPermissions", async () => {
  // Placeholder: Fetch app permissions
  return { enabled: true };
});

resolver.define("togglePermissions", async ({ payload }) => {
  const { enabled } = payload;
  // Placeholder: Update app permissions
  return { success: true, enabled };
});

resolver.define("isAppEnabled", async ({ payload, context }) => {
  const { projectId } = payload;

  try {
    const response = await fetch(
      `https://api.atlassian.com/ex/jira/${context.cloudId}/rest/api/3/project/${projectId}/properties/${PROPERTY_KEY}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      return { enabled: data.value === "true" };
    }
    return { enabled: true }; // Mặc định enabled nếu property chưa tồn tại
  } catch (error) {
    console.error("Error checking app status:", error);
    return { enabled: true }; // Fallback
  }
});

resolver.define("fetchProjectRoles", async ({ payload }) => {
  const { projectId } = payload;
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
});

resolver.define("fetchUsersForRole", async ({ payload }) => {
  const { projectId, roleId } = payload;
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
      accountId: actor.actorUser?.accountId || null,
    }));
  } catch (err) {
    console.error("Failed to fetch users for role:", err);
    throw err;
  }
});

resolver.define("fetchStatuses", async ({ payload }) => {
  const { projectKey } = payload;
  return await fetchStatuses(projectKey);
});

export const handler = resolver.getDefinitions();
