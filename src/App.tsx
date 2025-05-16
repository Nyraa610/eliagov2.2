import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase, setupAuthListener } from './lib/supabase';
import { Account } from './pages/Account';
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Dashboard } from './pages/Dashboard';
import { useTranslation } from 'react-i18next';
import './i18n';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthContext } from './contexts/AuthContext';
import { DocumentCenter } from './pages/DocumentCenter';

function App() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { subscription } = setupAuthListener((authStatus: boolean) => {
      setIsAuthenticated(authStatus);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>{t('common.loading', 'Loading...')}</div>;
  }
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/account"
            element={
              isAuthenticated ? (
                <Account />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Auth
                  supabaseClient={supabase}
                  appearance={{ theme: ThemeSupa }}
                  providers={['google', 'github']}
                  localization={{
                    variables: {
                      sign_in: {
                        email_label: t('auth.emailLabel', 'Email address'),
                        password_label: t('auth.passwordLabel', 'Password'),
                      },
                    },
                  }}
                  redirectTo={`${window.location.origin}/dashboard`}
                />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route path="/documents/personal" element={<DocumentCenter />} />
        </Routes>
        <Footer />
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
