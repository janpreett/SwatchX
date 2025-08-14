import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Company = 'Swatch' | 'SWS';

interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company) => void;
  clearSelectedCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export { CompanyContext };

interface CompanyProviderProps {
  children: ReactNode;
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const clearSelectedCompany = () => {
    setSelectedCompany(null);
  };

  const value = {
    selectedCompany,
    setSelectedCompany,
    clearSelectedCompany,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}
