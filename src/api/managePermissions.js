const { requestJira, route } = require('@forge/api');

const PROPERTY_KEY = 'issues-app:view-issues';

const getPermission = async (projectId) => {
  try {
    if (!projectId) {
      console.warn('getPermission: projectId is missing'); // Debug log
      return { enabled: false, error: 'Project ID is missing' };
    }
    const response = await requestJira(
      route`/rest/api/3/project/${projectId}/properties/${PROPERTY_KEY}`
    );
    console.log('getPermission response:', response.status); // Debug log
    if (response.status === 404) {
      return { enabled: false }; // Property not set
    }
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get permission: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return { enabled: data.value?.enabled ?? false };
  } catch (err) {
    console.error('getPermission error:', err.message); // Debug log
    return { enabled: false, error: err.message };
  }
};

const setPermission = async (projectId, enabled) => {
  try {
    if (!projectId) {
      console.warn('setPermission: projectId is missing'); // Debug log
      return { success: false, error: 'Project ID is missing' };
    }
    const response = await requestJira(
      route`/rest/api/3/project/${projectId}/properties/${PROPERTY_KEY}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      }
    );
    console.log('setPermission response:', response.status); // Debug log
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to set permission: ${response.status} - ${errorText}`);
    }
    return { success: true, enabled };
  } catch (err) {
    console.error('setPermission error:', err.message); // Debug log
    return { success: false, error: err.message };
  }
};

module.exports = {
  getPermission,
  setPermission,
};