import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useSearchParams,
} from "react-router-dom";
import HomePage from "./pages/HomePage";

/**
 * Safe wrapper for search params
 */
function useSafeSearchParams() {
  try {
    return useSearchParams();
  } catch (e) {
    console.warn("Router not available. Falling back to defaults.");
    return [new URLSearchParams(), () => {}];
  }
}

/**
 * MOA Page
 */
function MOAPage() {
  const [searchParams, setSearchParams] = useSafeSearchParams();

  const initialDrug = searchParams.get("drug") || "both";
  const initialSection = searchParams.get("section") || "overview";

  const [activeTab, setActiveTab] = useState(initialSection);
  const [selectedDrug, setSelectedDrug] = useState(initialDrug);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("drug", selectedDrug);
    params.set("section", activeTab);
    setSearchParams(params, { replace: true });
  }, [selectedDrug, activeTab, setSearchParams]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>MOA Visualization</h1>
      <p>Tab: {activeTab}</p>
      <p>Drug: {selectedDrug}</p>
    </div>
  );
}

/**
 * Temporary placeholder pages (CRITICAL FIX)
 */
function SearchPage() {
  return <div style={{ padding: 20 }}>Search Page</div>;
}

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

        {/* 🔥 THESE FIX THE CRASH */}
        <Route path="/search" element={<SearchPage />} />
        <Route path="/docs" element={<DocsPage />} />

        {/* fallback route */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
