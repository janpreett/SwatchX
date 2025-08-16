import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Company = 'Swatch' | 'SWS';

interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
  clearSelectedCompany: () => void;
  loading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export { CompanyContext };

interface CompanyProviderProps {
  children: ReactNode;
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [loading, setLoading] = useState(true);
  
  // Initialize from localStorage if available
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(() => {
    const saved = localStorage.getItem('selectedCompany');
    return saved as Company | null;
  });

  // Set loading to false after initialization
  useEffect(() => {
    setLoading(false);
  }, []);

  const clearSelectedCompany = () => {
    setSelectedCompany(null);
    localStorage.removeItem('selectedCompany');
  };

  // Update localStorage when company changes
  const handleSetSelectedCompany = (company: Company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompany', company);
  };

  const value = {
    selectedCompany,
    setSelectedCompany: handleSetSelectedCompany,
    clearSelectedCompany,
    loading,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}
