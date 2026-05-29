import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FaultClassDetail from './pages/FaultClassDetail';
import GlobalAnswers from './pages/GlobalAnswers';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/fault-class/:id"
        element={
          <PrivateRoute>
            <FaultClassDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/global-answers"
        element={
          <PrivateRoute>
            <GlobalAnswers />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
