import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Crop } from '@/types';
import { getCrops } from '@/services/cropService';
import { getPendingInvitations } from '@/services/cropShareService';

interface CropFilterContextType {
  crops: Crop[];
  ownedCrops: Crop[];
  sharedCrops: Crop[];
  selectedCropId: string | null;
  selectedCrop: Crop | null;
  setSelectedCropId: (cropId: string | null) => void;
  isSelectedCropShared: boolean;
  loading: boolean;
  error: string | null;
  refreshCrops: () => Promise<void>;
  pendingInvitationCount: number;
}

const CropFilterContext = createContext<CropFilterContextType | undefined>(undefined);

export const CropFilterProvider = ({ children }: { children: ReactNode }) => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);

  const ownedCrops = crops.filter((c) => !c._shared);
  const sharedCrops = crops.filter((c) => c._shared);
  const isSelectedCropShared = selectedCrop?._shared ?? false;

  const refreshCrops = useCallback(async () => {
    try {
      setLoading(true);
      const [cropsData, invitations] = await Promise.all([
        getCrops(),
        getPendingInvitations(),
      ]);
      setCrops(cropsData);
      setPendingInvitationCount(invitations.length);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCrops();
  }, [refreshCrops]);

  useEffect(() => {
    if (selectedCropId) {
      const crop = crops.find((c) => c.id === selectedCropId);
      setSelectedCrop(crop || null);
    } else {
      setSelectedCrop(null);
    }
  }, [selectedCropId, crops]);

  const value = {
    crops,
    ownedCrops,
    sharedCrops,
    selectedCropId,
    selectedCrop,
    setSelectedCropId,
    isSelectedCropShared,
    loading,
    error,
    refreshCrops,
    pendingInvitationCount,
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
