import Resolver from "@forge/resolver";
import { fetch } from "@forge/api";
import api, { route } from "@forge/api";

const settingsResolver = new Resolver();

const PROPERTY_KEY = "issuesAppEnabled";

settingsResolver.define("getProjectSetting", async ({ payload, context }) => {
  const { projectId } = payload;

  try {
    const response = await api
      .asUser()
      .requestJira(
        route`/rest/api/3/project/${projectId}/properties/${PROPERTY_KEY}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

    if (response.status === 200) {
      const data = await response.json();
      console.log("data", data);
      return { enabled: data.value.enabled === "true" };
    }
    return { enabled: true };
  } catch (error) {
    console.error("Error getting project property:", error);
    return { enabled: true };
  }
});

settingsResolver.define("setProjectSetting", async ({ payload, context }) => {
  const { projectId, enabled } = payload;
  console.log("setProjectSetting payload:", payload);

  try {
    const response = await api
      .asUser()
      .requestJira(
        route`/rest/api/3/project/${projectId}/properties/${PROPERTY_KEY}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enabled: enabled ? "true" : "false",
          }),
        }
      );
    // console.log("setProjectSetting response:", response);
    return { success: response.status === 200 };
  } catch (error) {
    console.error("Error setting project property:", error);

    return { success: false };
  }
});

export const run = settingsResolver.getDefinitions();
