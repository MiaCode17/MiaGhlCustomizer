import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { companyService } from '../services/companyService';
import { useSession } from './SessionContext';
import { Company, CompanyUpdateInput } from '../types/company';

interface CompanyContextValue {
  company: Company | null;
  isLoading: boolean;
  updateCompany: (input: CompanyUpdateInput) => Promise<void>;
  setGhlApiToken: (token: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompany(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    companyService
      .get()
      .then(setCompany)
      .finally(() => setIsLoading(false));
  }, [user]);

  const updateCompany = useCallback(async (input: CompanyUpdateInput) => {
    const updated = await companyService.update(input);
    setCompany(updated);
  }, []);

  const setGhlApiToken = useCallback(async (token: string) => {
    setCompany(await companyService.setGhlApiToken(token));
  }, []);

  const value = useMemo(
    () => ({ company, isLoading, updateCompany, setGhlApiToken }),
    [company, isLoading, updateCompany, setGhlApiToken],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany(): CompanyContextValue {
  const ctx = useContext(CompanyContext);
  if (!ctx) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return ctx;
}
