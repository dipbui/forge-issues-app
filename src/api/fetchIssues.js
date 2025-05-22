import api, { route } from "@forge/api";

export async function fetchIssues(projectId, startAt = 0, maxResults = 50) {
  const response = await api.asApp().requestJira(
    route`/rest/api/3/search?jql=project=${projectId} ORDER BY created ASC&startAt=${startAt}&maxResults=${maxResults}
`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch issues");
  }
  const data = await response.json();
  return {
    issues: data.issues.map((issue) => ({
      id: issue.id,
      key: issue.key,
      type: issue.fields.issuetype.name,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
      assignee: issue.fields.assignee
        ? issue.fields.assignee?.displayName
        : "Unassigned",
      assigneeAccountId: issue.fields.assignee?.accountId || "",
      parentId: issue.fields.parent ? issue.fields.parent.id : null,
      assigneeAvatarUrl: issue.fields.assignee?.avatarUrls["48x48"] || "",
      statusIconUrl: issue.fields.status.iconUrl || "",
    })),
    total: data.total,
    startAt: data.startAt,
    maxResults: data.maxResults,
  };
}
