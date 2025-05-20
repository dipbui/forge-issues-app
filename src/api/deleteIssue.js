import api, { route } from '@forge/api';

export async function deleteIssue(issueId) {
  const response = await api.asApp().requestJira(route`/rest/api/3/issue/${issueId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to delete issue');
  }
  return { success: true };
}