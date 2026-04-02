import { useCropFilter } from '@/contexts/CropFilterContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CropFilter = () => {
  const { ownedCrops, sharedCrops, selectedCropId, setSelectedCropId, loading } = useCropFilter();
  const allCrops = [...ownedCrops, ...sharedCrops];
  const selectedCrop = allCrops.find(crop => crop.id === selectedCropId);

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
            {ownedCrops.map((crop) => (
              <SelectItem key={crop.id} value={crop.id}>
                {crop.name}
              </SelectItem>
            ))}
            {sharedCrops.length > 0 && (
              <>
                <SelectSeparator />
                <div className="px-2 py-1 text-xs text-muted-foreground">Shared with me</div>
                {sharedCrops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3 shrink-0" />
                      {crop.name}
                    </span>
                  </SelectItem>
                ))}
              </>
            )}
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
          {selectedCrop._shared && <Share2 className="h-3 w-3" />}
          Showing: <span className="font-medium">{selectedCrop.name}</span>
        </div>
      )}
    </div>
  );
};

export default CropFilter;
