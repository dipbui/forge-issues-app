import React from "react";
import { Routes, Route } from "react-router-dom";
import AppProvider from "@atlaskit/app-provider";
import SettingsPage from "./SettingsPage";

const App = () => {
  return (
    <div style={{ padding: "20px" }}>
      <AppProvider>
        <Routes>
          <Route path="/" element={<SettingsPage />} />
        </Routes>
      </AppProvider>
    </div>
  );
};

export default App;
