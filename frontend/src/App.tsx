import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Builder from './pages/Builder';
import Preview from './pages/Preview';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import TableDesigner from './pages/TableDesigner';
import DataManager from './pages/DataManager';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Hooks
import { useRouteChangeHandler } from './hooks/useRouteChangeHandler';
import { useAuthStore } from './store/authStore';

function AppContent() {
  // Handle route changes to clear selected component state
  useRouteChangeHandler();
  
  // Initialize auth state on app start
  const { initializeAuth } = useAuthStore();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/builder" 
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/builder/:projectId" 
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/builder/:projectId/:pageId" 
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/preview/:projectId" 
          element={
            <ProtectedRoute>
              <Preview />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:projectId" 
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects/:projectId/tables" 
          element={
            <ProtectedRoute>
              <TableDesigner />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects/:projectId/tables/:tableId/data" 
          element={
            <ProtectedRoute>
              <DataManager />
            </ProtectedRoute>
          } 
        />
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
