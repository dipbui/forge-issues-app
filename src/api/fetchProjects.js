import api, { route } from "@forge/api";

export async function fetchProjects() {
  const response = await api.asApp().requestJira(route`/rest/api/3/project`);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch projects failed:", response.status, errorText); // Debug log
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }
  const data = await response.json();
  return data.map((project) => ({
    id: project.id,
    key: project.key,
    name: project.name,
  }));
}
