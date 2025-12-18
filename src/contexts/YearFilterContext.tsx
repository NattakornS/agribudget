'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface YearFilterContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[];
  refreshYears: () => Promise<void>;
  isAllYears: boolean;
}

const YearFilterContext = createContext<YearFilterContextType | undefined>(undefined);

interface YearFilterProviderProps {
  children: ReactNode;
}

export function YearFilterProvider({ children }: YearFilterProviderProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const isAllYears = selectedYear === 0;

  const refreshYears = async () => {
    try {
      // For now, we'll just add years from 2020 to current year
      // Later we can fetch actual years from the database if needed
      const years: number[] = [0]; // 0 represents "All Years"
      for (let year = 2020; year <= currentYear; year++) {
        years.push(year);
      }
      setAvailableYears(years);
    } catch (error) {
      console.error('Error refreshing years:', error);
    }
  };

  useEffect(() => {
    refreshYears();
  }, []);

  return (
    <YearFilterContext.Provider value={{ selectedYear, setSelectedYear, availableYears, refreshYears, isAllYears }}>
      {children}
    </YearFilterContext.Provider>
  );
}

export function useYearFilter() {
  const context = useContext(YearFilterContext);
  if (context === undefined) {
    throw new Error('useYearFilter must be used within a YearFilterProvider');
  }
  return context;
}
