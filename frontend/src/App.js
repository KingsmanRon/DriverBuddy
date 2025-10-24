import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import HomePage from './pages/HomePage';
import LicensesPage from './pages/LicensesPage';
import LicenseDetailPage from './pages/LicenseDetailPage';
import './App.css';

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/licenses" element={<LicensesPage />} />
          <Route path="/license/:id" element={<LicenseDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;
