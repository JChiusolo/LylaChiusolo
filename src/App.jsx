import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AuthCallback from './pages/AuthCallback'
// Import your other pages/components here
import YourMainPage from './pages/YourMainPage' // Replace with your actual main page

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<YourMainPage />} />
        {/* Add your other routes here */}
      </Routes>
    </Router>
  )
}
