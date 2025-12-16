import { useCropFilter } from '@/contexts/CropFilterContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CropFilter = () => {
  const { crops, selectedCropId, setSelectedCropId, loading } = useCropFilter();

  const selectedCrop = crops.find(crop => crop.id === selectedCropId);

  if (loading) {
    return <Skeleton className="h-8 w-32" />;
  }

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-1">
        <Select 
          value={selectedCropId || 'all'} 
          onValueChange={(value) => setSelectedCropId(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue placeholder="Filter by crop" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Crops</SelectItem>
            {crops.map((crop) => (
              <SelectItem key={crop.id} value={crop.id}>
                {crop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCropId && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setSelectedCropId(null)}
            title="Clear filter"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {selectedCrop && (
        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 rounded">
          Showing: <span className="font-medium">{selectedCrop.name}</span>
        </div>
      )}
    </div>
  );
};

export default CropFilter;
