import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AppProvider from "@atlaskit/app-provider";
import IssuesPage from "./IssuesPage";
import "@atlaskit/css-reset";
const App = () => {
  return (
    <div style={{ padding: "20px" }}>
      <AppProvider>
        <Routes>
          <Route path="/" element={<IssuesPage />} />
        </Routes>
      </AppProvider>
    </div>
  );
};

export default App;
