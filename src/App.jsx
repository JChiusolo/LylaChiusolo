import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MOAVisualization from './components/MOAVisualization';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        
        {/* NEW MOA ROUTES */}
        <Route path="/moa" element={<MOAVisualization />} />
        <Route path="/moa/:drug" element={<MOAVisualization />} />
        
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
