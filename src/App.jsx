import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import MOAVisualization from './components/MOAVisualization';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<HomePage />} />
        
        {/* ENHANCED SEARCH PAGE */}
        <Route path="/search" element={<SearchPage />} />
        
        {/* MOA ROUTES - Now support URL params for smart navigation */}
        <Route path="/moa" element={<MOAVisualization />} />
        <Route path="/moa/:drug" element={<MOAVisualization />} />
        
        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
