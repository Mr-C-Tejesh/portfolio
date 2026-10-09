import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import NavigationPill from './components/NavigationPill';
import Home from './pages/Home';
import Work from './pages/Work';
import ProjectDetail from './pages/ProjectDetail';

function AppContent() {
  const location = useLocation();
  const [isNavVisible, setIsNavVisible] = useState(false);

  // When not on the home page, the navigation is always visible
  useEffect(() => {
    if (location.pathname !== '/') {
      setIsNavVisible(true);
    }
  }, [location]);

  const handleHeroVisible = (isIntersecting) => {
    // Only manage visibility via scroll on the homepage
    if (location.pathname === '/') {
      setIsNavVisible(!isIntersecting);
    }
  };

  return (
    <>
      <NavigationPill isVisible={isNavVisible} />
      <Routes>
        <Route path="/" element={<Home onHeroVisible={handleHeroVisible} />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:slug" element={<ProjectDetail />} />
        {/* Fallback route for unknown paths */}
        <Route path="*" element={<ProjectDetail />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
