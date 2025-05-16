
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

// Define the Company interface
interface Company {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  created_at: string;
}

// Define the context interface
interface CompanyContextType {
  company: Company | null;
  loading: boolean;
  error: string | null;
  setCompany: (company: Company | null) => void;
  refreshCompany: () => Promise<void>;
}

// Create the context
const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Provider component
interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the authenticated user
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData?.user) {
        setLoading(false);
        return;
      }
      
      // Get the user's profile to find their company ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Failed to fetch user profile');
        setLoading(false);
        return;
      }
      
      if (!profileData?.company_id) {
        // User doesn't have a company yet
        setLoading(false);
        return;
      }
      
      // Fetch the company data
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profileData.company_id)
        .single();
      
      if (companyError) {
        console.error('Error fetching company:', companyError);
        setError('Failed to fetch company data');
        setLoading(false);
        return;
      }
      
      setCompany(companyData);
    } catch (err) {
      console.error('Unexpected error in fetchCompany:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load the company data on initial render
  useEffect(() => {
    fetchCompany();
  }, []);

  const refreshCompany = async () => {
    await fetchCompany();
  };

  const value = {
    company,
    loading,
    error,
    setCompany,
    refreshCompany
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

// Custom hook to use the company context
export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
