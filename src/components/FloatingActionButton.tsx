import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      size="icon"
      variant="default"
      className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 
                 transition-transform duration-200 md:bottom-6 p-0"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default FloatingActionButton;
