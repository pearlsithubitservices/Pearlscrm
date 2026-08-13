import React, { createContext, useContext, useState, useEffect } from 'react';
import { INDUSTRY_CONFIGS } from '../components/constants';

const IndustryContext = createContext(undefined);

export function IndustryProvider({ children }) {
  const [industry, setIndustry] = useState(() => {
    return localStorage.getItem('crm_industry') || 'IT';
  });

  useEffect(() => {
    localStorage.setItem('crm_industry', industry);
  }, [industry]);

  const config = INDUSTRY_CONFIGS[industry];

  return (
    <IndustryContext.Provider value={{ industry, config, setIndustry }}>
      {children}
    </IndustryContext.Provider>
  );
}

export function useIndustry() {
  const context = useContext(IndustryContext);
  if (context === undefined) {
    throw new Error('useIndustry must be used within an IndustryProvider');
  }
  return context;
}
