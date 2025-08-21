import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Crop, FertilizerPlan } from '@/types';



interface FertilizerUsageTableProps {
  fertilizerPlans: FertilizerPlan[];
  crops: Crop[];
}

interface FertilizerUsage {
  year: number;
  cropName: string;
  totalFertilizer: number;
  treesAmount: number;
  fertilizerPerTree: number;
  fertilizerTypes: string[];
  completedPlans: number;
  totalPlans: number;
}

export const FertilizerUsageTable = ({ fertilizerPlans, crops }: FertilizerUsageTableProps) => {
  const fertilizerData = useMemo(() => {
    const cropsMap = new Map(crops.map(crop => [crop.id, crop]));
    
    // First group by year and crop
    const usageByYearAndCrop = fertilizerPlans.reduce((acc, plan) => {
      const year = new Date(plan.plan_date).getFullYear();
      const cropId = plan.crop_id;
      const key = `${year}-${cropId}`;

      if (!acc[key]) {
        const crop = cropsMap.get(cropId);
        acc[key] = {
          year,
          cropName: plan.crops?.name||'',
          totalFertilizer: 0,
          treesAmount: crop?.amount || 0,
          fertilizerPerTree: 0,
          fertilizerTypes: [],
          completedPlans: 0,
          totalPlans: 0,
        };
      }

      acc[key].totalFertilizer += plan.amount_kg||0;
      if (!acc[key].fertilizerTypes.includes(plan.fertilizer_type||'')) {
        acc[key].fertilizerTypes.push(plan.fertilizer_type||'');
      }
      acc[key].totalPlans++;
      if (plan.status === 'complete') {
        acc[key].completedPlans++;
      }
      acc[key].fertilizerPerTree = acc[key].treesAmount > 0 
        ? acc[key].totalFertilizer / acc[key].treesAmount 
        : 0;

      return acc;
    }, {} as Record<string, FertilizerUsage>);

    // Convert to array and sort by year and crop name
    return Object.values(usageByYearAndCrop).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.cropName.localeCompare(b.cropName);
    });
  }, [fertilizerPlans, crops]);

  if (fertilizerData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No fertilizer plans available
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Year</TableHead>
            <TableHead>Crop</TableHead>
            <TableHead className="text-right">Trees</TableHead>
            <TableHead className="text-right">Total Fertilizer</TableHead>
            <TableHead className="text-right">Fertilizer/Tree</TableHead>
            <TableHead className="text-right">Progress</TableHead>
            <TableHead>Fertilizer Types</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fertilizerData.map((usage) => (
            <TableRow key={`${usage.year}-${usage.cropName}`}>
              <TableCell>{usage.year}</TableCell>
              <TableCell>{usage.cropName}</TableCell>
              <TableCell className="text-right">{usage.treesAmount.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                {usage.totalFertilizer.toLocaleString()} kg
              </TableCell>
              <TableCell className="text-right">
                {usage.fertilizerPerTree.toFixed(2)} kg/tree
              </TableCell>
              <TableCell className="text-right">
                {usage.completedPlans}/{usage.totalPlans} plans
              </TableCell>
              <TableCell>
                {usage.fertilizerTypes.join(', ')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
