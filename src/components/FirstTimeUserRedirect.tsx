import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCrops } from '@/services/cropService';
import type { Crop } from '@/types';

interface FirstTimeUserRedirectProps {
  children: React.ReactNode;
}

const FirstTimeUserRedirect = ({ children }: FirstTimeUserRedirectProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserCrops = async () => {
      try {
        const crops: Crop[] = await getCrops();
        
        // If user has no crops, redirect to profile page with auto-open modal flag
        if (crops.length === 0) {
          setShouldRedirect(true);
          // Store flag in sessionStorage to trigger modal open
          sessionStorage.setItem('openCropModal', 'true');
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error checking user crops:', error);
        // On error, don't redirect, just show the original page
      } finally {
        setIsLoading(false);
      }
    };

    // Only check if we're not already on profile page and no modal flag is set
    if (!window.location.pathname.includes('/profile') && !sessionStorage.getItem('openCropModal')) {
      checkUserCrops();
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen min-w-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (shouldRedirect) {
    return null; // Will redirect
  }

  return <>{children}</>;
};

export default FirstTimeUserRedirect;
