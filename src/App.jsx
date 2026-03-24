import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useSearchParams,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import MOAVisualization from "./components/MOAVisualization";

/**
 * MOA Page — wraps MOAVisualization with URL param sync
 */
function MOAPage() {
  return <MOAVisualization />;
}

/**
 * Docs placeholder
 */
function DocsPage() {
  return <div style={{ padding: 20 }}>Docs Page</div>;
}

/**
 * Root App
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/moa" element={<MOAPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
