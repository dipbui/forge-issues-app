import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Toggle from "@atlaskit/toggle";
import { invoke, view } from "@forge/bridge";

const SettingsPage = () => {
  const [projectId, setProjectId] = useState("");
  console.log("projectId:", projectId);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  console.log("projectId:", projectId);
  useEffect(() => {
    view.getContext().then((context) => {
      const project = context.extension.project;
      console.log("context:", context);
      console.log("project:", project);
      if (project) {
        setProjectId(project.id);
      }
    });
  }, []);

  useEffect(() => {
    const fetchSetting = async () => {
      console.log("projectId:", projectId);
      const result = await invoke("getProjectSetting", { projectId });

      setEnabled(result.enabled);
      setLoading(false);
    };
    fetchSetting();
  }, [projectId]);

  const handleToggle = async () => {
    const newValue = !enabled;
    setLoading(true);
    const { success } = await invoke("setProjectSetting", {
      projectId,
      enabled: newValue,
    });

    if (success) {
      setEnabled(newValue);
    } else {
      alert("Failed to update settings. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "10px" }}>Issues App Settings</h2>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Toggle
          isChecked={enabled}
          onChange={handleToggle}
          isDisabled={loading}
        />
        <span>{enabled ? "Enabled" : "Disabled"}</span>
      </div>
      <p style={{ fontSize: "12px", fontWeight: "lighter" }}>
        If you want to enable/disable the app, you can do it here.
      </p>
    </div>
  );
};

export default SettingsPage;
