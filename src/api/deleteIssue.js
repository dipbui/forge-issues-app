import api, { route } from "@forge/api";

export async function deleteIssueWithSubtasks(issueId) {
  try {
    const issueResponse = await api
      .asApp()
      .requestJira(route`/rest/api/3/issue/${issueId}?expand=subtasks`, {
        method: "GET",
      });

    if (!issueResponse.ok) {
      throw new Error(`Failed to fetch issue details: ${issueResponse.status}`);
    }

    const issueData = await issueResponse.json();
    const subtasks = issueData.fields.subtasks || [];

    if (subtasks.length > 0) {
      console.log(`Found ${subtasks.length} subtasks to delete`);

      for (const subtask of subtasks) {
        const deleteSubtaskResponse = await api
          .asApp()
          .requestJira(route`/rest/api/3/issue/${subtask.key}`, {
            method: "DELETE",
          });

        if (!deleteSubtaskResponse.ok) {
          throw new Error(
            `Failed to delete subtask ${subtask.key}: ${deleteSubtaskResponse.status}`
          );
        }

        console.log(`Subtask ${subtask.key} deleted successfully`);
      }
    }

    const deleteParentResponse = await api
      .asApp()
      .requestJira(route`/rest/api/3/issue/${issueId}`, {
        method: "DELETE",
      });

    if (!deleteParentResponse.ok) {
      throw new Error(
        `Failed to delete parent issue: ${deleteParentResponse.status}`
      );
    }

    return {
      success: true,
      deletedSubtasks: subtasks.length,
      message: `Successfully deleted issue and ${subtasks.length} subtasks`,
    };
  } catch (error) {
    console.error("Error deleting issue with subtasks:", error);
    throw error;
  }
}

export async function deleteIssue(issueId) {
  try {
    const issueResponse = await api
      .asApp()
      .requestJira(route`/rest/api/3/issue/${issueId}?expand=subtasks`, {
        method: "GET",
      });

    if (!issueResponse.ok) {
      throw new Error(`Failed to fetch issue details: ${issueResponse.status}`);
    }

    const issueData = await issueResponse.json();
    const subtasks = issueData.fields.subtasks || [];

    // Prevent deletion if subtasks exist
    if (subtasks.length > 0) {
      throw new Error(
        `Cannot delete issue with ${subtasks.length} subtasks. Delete subtasks first or use deleteIssueWithSubtasks.`
      );
    }

    const response = await api
      .asApp()
      .requestJira(route`/rest/api/3/issue/${issueId}`, {
        method: "DELETE",
      });

    if (!response.ok) {
      throw new Error(`Failed to delete issue: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting issue:", error);
    throw error;
  }
}
