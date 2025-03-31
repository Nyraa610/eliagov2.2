import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Pricing } from './pages/Pricing';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import Account from './pages/Account';
import Admin from './pages/Admin';
import Assessment from './pages/Assessment';
import ValueChain from './pages/ValueChain';
import Training from './pages/Training';
import Rewards from './pages/Rewards';
import Company from './pages/Company';
import { Engagement } from './pages/Engagement';
import { AdminLayout } from './components/admin/AdminLayout';
import Users from './pages/admin/Users';
import Companies from './pages/admin/Companies';
import Assessments from './pages/admin/Assessments';
import EmissionFactors from './pages/admin/EmissionFactors';
import Courses from './pages/admin/Courses';
import { UserLayout } from './components/user/UserLayout';
import { Course } from './pages/Course';
import { Module } from './pages/Module';
import { Content } from './pages/Content';
import { NotFound } from './pages/NotFound';
import { Sustainability } from './pages/Sustainability';
import DocumentCenter from "@/pages/DocumentCenter";

function App() {
  const session = useSession()
  const supabase = useSupabaseClient()

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/assessment" element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          } />
          <Route path="/assessment/value-chain" element={
            <ProtectedRoute>
              <ValueChain />
            </ProtectedRoute>
          } />
           <Route path="/training" element={
            <ProtectedRoute>
              <Training />
            </ProtectedRoute>
          } />
          <Route path="/rewards" element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          } />
          <Route path="/company" element={
            <ProtectedRoute>
              <Company />
            </ProtectedRoute>
          } />
           <Route path="/engagement" element={
            <ProtectedRoute>
              <Engagement />
            </ProtectedRoute>
          } />
          <Route path="/course/:courseId" element={
            <ProtectedRoute>
              <Course />
            </ProtectedRoute>
          } />
           <Route path="/module/:moduleId" element={
            <ProtectedRoute>
              <Module />
            </ProtectedRoute>
          } />
           <Route path="/content/:contentId" element={
            <ProtectedRoute>
              <Content />
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
           <Route path="/admin/users" element={
             <ProtectedRoute>
               <AdminLayout title="Users" description="Manage all users">
                 <Users />
               </AdminLayout>
             </ProtectedRoute>
           } />
            <Route path="/admin/companies" element={
             <ProtectedRoute>
               <AdminLayout title="Companies" description="Manage all companies">
                 <Companies />
               </AdminLayout>
             </ProtectedRoute>
           } />
           <Route path="/admin/assessments" element={
             <ProtectedRoute>
               <AdminLayout title="Assessments" description="Manage all assessments">
                 <Assessments />
               </AdminLayout>
             </ProtectedRoute>
           } />
            <Route path="/admin/emission-factors" element={
             <ProtectedRoute>
               <AdminLayout title="Emission Factors" description="Manage all emission factors">
                 <EmissionFactors />
               </AdminLayout>
             </ProtectedRoute>
           } />
           <Route path="/admin/courses" element={
             <ProtectedRoute>
               <AdminLayout title="Courses" description="Manage all courses">
                 <Courses />
               </AdminLayout>
             </ProtectedRoute>
           } />
          <Route path="/login" element={
            !session ? (
              <LoginPage />
            ) : (
              <Navigate to="/account" replace />
            )
          } />
          <Route path="*" element={<NotFound />} />
          <Route path="/documents" element={
            <ProtectedRoute>
              <DocumentCenter />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );

  function LoginPage() {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-2xl font-semibold mb-4">Login</h2>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google', 'github']}
            redirectTo={`${window.location.origin}/account`}
          />
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
