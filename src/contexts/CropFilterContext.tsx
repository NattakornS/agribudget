'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Crop } from '@/types';
import { getCrops } from '@/services/cropService';

interface CropFilterContextType {
  crops: Crop[];
  selectedCropId: string | null;
  setSelectedCropId: (cropId: string | null) => void;
  loading: boolean;
  error: string | null;
}

const CropFilterContext = createContext<CropFilterContextType | undefined>(undefined);

export const CropFilterProvider = ({ children }: { children: ReactNode }) => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        setLoading(true);
        const cropsData = await getCrops();
        setCrops(cropsData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  const value = {
    crops,
    selectedCropId,
    setSelectedCropId,
    loading,
    error,
  };

  return (
    <CropFilterContext.Provider value={value}>
      {children}
    </CropFilterContext.Provider>
  );
};

export const useCropFilter = () => {
  const context = useContext(CropFilterContext);
  if (context === undefined) {
    throw new Error('useCropFilter must be used within a CropFilterProvider');
  }
  return context;
};
