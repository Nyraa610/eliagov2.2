
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import DocumentCenter from "@/pages/DocumentCenter";
import NotFound from './pages/NotFound';
import Assessment from './pages/Assessment';
import { AdminLayout } from './components/admin/AdminLayout';
import { UserLayout } from './components/user/UserLayout';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

function App() {
  const session = useSession()
  const supabase = useSupabaseClient()

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/assessment" element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute>
              <DocumentCenter />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            !session ? (
              <LoginPage />
            ) : (
              <Navigate to="/assessment" replace />
            )
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );

  function LoginPage() {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-2xl font-semibold mb-4">Login</h2>
          {supabase && (
            <div>Please log in to continue</div>
          )}
        </div>
      </div>
    );
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = useSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default App;
