import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useSearchParams,
} from "react-router-dom";
import HomePage from "./pages/HomePage";

/**
 * Safe wrapper for search params so app doesn't crash
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
 * Your existing logic preserved inside a routed page
 */
function MOAPage() {
  const [searchParams, setSearchParams] = useSafeSearchParams();

  const initialDrug = searchParams.get("drug") || "both";
  const initialSection = searchParams.get("section") || "overview";

  const [activeTab, setActiveTab] = useState(initialSection);
  const [selectedDrug, setSelectedDrug] = useState(initialDrug);

  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedDrug) params.set("drug", selectedDrug);
    if (activeTab) params.set("section", activeTab);

    setSearchParams(params, { replace: true });
  }, [selectedDrug, activeTab, setSearchParams]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>MOA Visualization</h1>

      <div style={{ marginBottom: "20px" }}>
        <strong>Select Drug: </strong>
        <button onClick={() => setSelectedDrug("both")}>Both</button>
        <button onClick={() => setSelectedDrug("drugA")}>Drug A</button>
        <button onClick={() => setSelectedDrug("drugB")}>Drug B</button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <strong>Section: </strong>
        <button onClick={() => setActiveTab("overview")}>Overview</button>
        <button onClick={() => setActiveTab("mechanism")}>Mechanism</button>
        <button onClick={() => setActiveTab("clinical")}>Clinical</button>
      </div>

      <div style={{ border: "1px solid #ccc", padding: "20px" }}>
        <p>
          <strong>Active Tab:</strong> {activeTab}
        </p>
        <p>
          <strong>Selected Drug:</strong> {selectedDrug}
        </p>
      </div>
    </div>
  );
}

/**
 * Root App with routing (fixes HomePage error)
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/moa" element={<MOAPage />} />
      </Routes>
    </BrowserRouter>
  );
}
