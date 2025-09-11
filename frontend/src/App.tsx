import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Builder from './pages/Builder';
import Preview from './pages/Preview';
import Projects from './pages/Projects';

// Components
import Navbar from './components/Navbar';

// Hooks
import { useRouteChangeHandler } from './hooks/useRouteChangeHandler';

function AppContent() {
  // Handle route changes to clear selected component state
  useRouteChangeHandler();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/builder/:projectId" element={<Builder />} />
        <Route path="/preview/:projectId" element={<Preview />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <AppContent />
      </Router>
    </DndProvider>
  );
}

export default App;
