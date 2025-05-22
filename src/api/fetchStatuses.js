import api, { route } from "@forge/api";

export const fetchStatuses = async (projectKey) => {
  try {
    const response = await api
      .asUser()
      .requestJira(route`/rest/api/3/project/${projectKey}/statuses`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Statuses API error:", errorData);
      throw new Error(
        `Failed to fetch statuses: ${errorData.message || response.statusText}`
      );
    }

    const statusData = await response.json();

    // Process the response to extract all unique statuses
    const allStatuses = [];
    const seenStatusIds = new Set();

    statusData.forEach((issueType) => {
      issueType.statuses.forEach((status) => {
        if (!seenStatusIds.has(status.id)) {
          seenStatusIds.add(status.id);
          allStatuses.push({
            id: status.id,
            name: status.name,
            description: status.description,
            statusCategory: status.statusCategory,
            iconUrl: status.iconUrl,
          });
        }
      });
    });
    return allStatuses;
  } catch (err) {
    console.error("Failed to fetch statuses:", err);
    throw err;
  }
};
